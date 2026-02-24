"""
Address Endpoints
API routes for address management
"""

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.schemas.address import AddressCreate, AddressListResponse, AddressResponse, AddressUpdate
from app.services.address_service import AddressService

router = APIRouter(prefix="/addresses", tags=["addresses"])


@router.post(
    "",
    response_model=AddressResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new address",
)
async def create_address(
    address_data: AddressCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create new shipping/billing address for current user

    - **label**: Optional label like 'Home', 'Work'
    - **street**: Street name (required)
    - **street_number**: Number, apartment, suite (optional)
    - **city**: City name (required)
    - **region**: State/Province (required)
    - **postal_code**: Postal/ZIP code (required)
    - **country**: 2-letter ISO code, default 'CL'
    - **is_default**: Set as default address (unsets others)
    """
    user_id = str(current_user.id)
    address = await AddressService.create_address(db, user_id, address_data)
    return address


@router.get("", response_model=AddressListResponse, summary="Get user addresses")
async def get_addresses(
    current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    Get all active addresses for current user

    Returns list ordered by:
    1. Default address first
    2. Most recently created
    """
    user_id = str(current_user.id)
    addresses = await AddressService.get_user_addresses(db, user_id)

    # Find default address ID
    default_id = next((addr.id for addr in addresses if addr.is_default), None)

    return AddressListResponse(
        addresses=addresses, total=len(addresses), default_address_id=default_id
    )


@router.get("/{address_id}", response_model=AddressResponse, summary="Get address by ID")
async def get_address(
    address_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get specific address by ID

    Must belong to current user
    """
    user_id = str(current_user.id)
    address = await AddressService.get_address_by_id(db, address_id, user_id)
    return address


@router.put("/{address_id}", response_model=AddressResponse, summary="Update address")
async def update_address(
    address_id: int,
    address_data: AddressUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update existing address

    All fields are optional. Only provided fields will be updated.
    """
    user_id = str(current_user.id)
    address = await AddressService.update_address(db, address_id, user_id, address_data)
    return address


@router.delete("/{address_id}", status_code=status.HTTP_200_OK, summary="Delete address")
async def delete_address(
    address_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete address (soft delete)

    Cannot delete:
    - Your only address
    - Your default address (set another as default first)
    """
    user_id = str(current_user.id)
    result = await AddressService.delete_address(db, address_id, user_id)
    return result


@router.patch(
    "/{address_id}/set-default", response_model=AddressResponse, summary="Set address as default"
)
async def set_default_address(
    address_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Set this address as default shipping/billing address

    Automatically unsets other default addresses
    """
    user_id = str(current_user.id)
    address = await AddressService.set_default_address(db, address_id, user_id)
    return address
