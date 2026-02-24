"""
Address Service
Business logic for address management
"""

from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate


class AddressService:
    """Service for managing user addresses"""

    @staticmethod
    async def create_address(
        db: AsyncSession, user_id: str, address_data: AddressCreate
    ) -> Address:
        """
        Create new address for user

        If is_default=True, unset other default addresses
        """
        # If this should be default, unset other defaults first
        if address_data.is_default:
            await AddressService._unset_default_addresses(db, user_id)

        # Create new address
        new_address = Address(user_id=user_id, **address_data.model_dump())

        db.add(new_address)
        await db.commit()
        await db.refresh(new_address)

        return new_address

    @staticmethod
    async def get_user_addresses(
        db: AsyncSession, user_id: str, include_inactive: bool = False
    ) -> List[Address]:
        """
        Get all addresses for a user

        Args:
            user_id: Clerk user ID
            include_inactive: Include soft-deleted addresses
        """
        query = select(Address).where(Address.user_id == user_id)

        if not include_inactive:
            query = query.where(Address.is_active.is_(True))

        query = query.order_by(Address.is_default.desc(), Address.created_at.desc())

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_address_by_id(
        db: AsyncSession, address_id: int, user_id: str
    ) -> Optional[Address]:
        """
        Get specific address by ID (must belong to user)
        """
        query = select(Address).where(
            and_(Address.id == address_id, Address.user_id == user_id, Address.is_active.is_(True))
        )

        result = await db.execute(query)
        address = result.scalar_one_or_none()

        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": f"Address {address_id} not found"},
            )

        return address

    @staticmethod
    async def get_default_address(db: AsyncSession, user_id: str) -> Optional[Address]:
        """Get user's default address"""
        query = select(Address).where(
            and_(
                Address.user_id == user_id,
                Address.is_default.is_(True),
                Address.is_active.is_(True),
            )
        )

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_address(
        db: AsyncSession, address_id: int, user_id: str, address_data: AddressUpdate
    ) -> Address:
        """
        Update address

        Only user who owns the address can update it
        """
        # Get existing address
        address = await AddressService.get_address_by_id(db, address_id, user_id)

        # If setting as default, unset other defaults
        if address_data.is_default and not address.is_default:
            await AddressService._unset_default_addresses(db, user_id)

        # Update fields (only non-None values)
        update_data = address_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(address, field, value)

        await db.commit()
        await db.refresh(address)

        return address

    @staticmethod
    async def delete_address(db: AsyncSession, address_id: int, user_id: str) -> dict:
        """
        Soft delete address (set is_active=False)

        Prevents deletion if it's the only address or default
        """
        address = await AddressService.get_address_by_id(db, address_id, user_id)

        # Check if user has other addresses
        all_addresses = await AddressService.get_user_addresses(db, user_id)

        if len(all_addresses) == 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Cannot delete your only address"},
            )

        if address.is_default:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": (
                        "Cannot delete default address. " "Set another address as default first."
                    )
                },
            )

        # Soft delete
        address.is_active = False
        await db.commit()

        return {"message": f"Address {address_id} deleted successfully"}

    @staticmethod
    async def set_default_address(db: AsyncSession, address_id: int, user_id: str) -> Address:
        """
        Set address as default

        Unsets other default addresses
        """
        address = await AddressService.get_address_by_id(db, address_id, user_id)

        # Unset other defaults
        await AddressService._unset_default_addresses(db, user_id)

        # Set this one as default
        address.is_default = True
        await db.commit()
        await db.refresh(address)

        return address

    @staticmethod
    async def _unset_default_addresses(db: AsyncSession, user_id: str) -> None:
        """Helper: Unset all default addresses for user"""
        stmt = (
            update(Address)
            .where(and_(Address.user_id == user_id, Address.is_default.is_(True)))
            .values(is_default=False)
        )
        await db.execute(stmt)
