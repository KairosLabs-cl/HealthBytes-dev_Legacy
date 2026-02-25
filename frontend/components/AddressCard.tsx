/**
 * AddressCard Component
 * Displays an address card with edit/delete/set-default actions
 */

import { Text } from "@/components/ui/text";
import type { Address } from "@/types/address";
import {
  CheckCircle2,
  Edit2,
  MapPin,
  MoreVertical,
  Star,
  Trash2,
} from "lucide-react-native";
import { memo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";

type AddressCardProps = {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: number) => void;
  onSetDefault: (addressId: number) => void;
  isDeleting?: boolean;
};

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
}: AddressCardProps) {
  const [showActions, setShowActions] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      "Eliminar dirección",
      "¿Estás seguro de que deseas eliminar esta dirección?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete(address.id),
        },
      ]
    );
  };

  const handleSetDefault = () => {
    if (!address.is_default) {
      onSetDefault(address.id);
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm">
      {/* Header with label and default badge */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <MapPin size={16} color="#6B7280" />
          <Text className="font-semibold text-gray-800">
            {address.label || "Dirección"}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {address.is_default && (
            <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-full">
              <Star size={12} color="#3B82F6" fill="#3B82F6" />
              <Text className="text-xs text-blue-600 ml-1 font-medium">
                Principal
              </Text>
            </View>
          )}

          {/* Actions menu */}
          <Pressable
            onPress={() => setShowActions(!showActions)}
            className="p-1"
          >
            <MoreVertical size={20} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      {/* Address details */}
      <View className="mb-3">
        <Text className="text-gray-700 text-sm leading-5">
          {address.street}
          {address.street_number ? `, ${address.street_number}` : ""}
        </Text>
        <Text className="text-gray-700 text-sm leading-5">
          {address.city}, {address.region}
        </Text>
        <Text className="text-gray-700 text-sm leading-5">
          {address.postal_code}, {address.country}
        </Text>
        {address.phone && (
          <Text className="text-gray-600 text-sm mt-1">
            Tel: {address.phone}
          </Text>
        )}
      </View>

      {/* Action buttons (conditional rendering) */}
      {showActions && (
        <View className="border-t border-gray-100 pt-3 gap-2">
          {/* Set as default */}
          {!address.is_default && (
            <Pressable
              onPress={handleSetDefault}
              className="flex-row items-center justify-center py-2 bg-blue-50 rounded-lg active:bg-blue-100"
            >
              <CheckCircle2 size={16} color="#3B82F6" />
              <Text className="text-blue-600 font-medium ml-2">
                Establecer como principal
              </Text>
            </Pressable>
          )}

          {/* Edit button */}
          <Pressable
            onPress={() => {
              setShowActions(false);
              onEdit(address);
            }}
            className="flex-row items-center justify-center py-2 bg-gray-50 rounded-lg active:bg-gray-100"
          >
            <Edit2 size={16} color="#6B7280" />
            <Text className="text-gray-700 font-medium ml-2">Editar</Text>
          </Pressable>

          {/* Delete button */}
          <Pressable
            onPress={handleDelete}
            disabled={isDeleting}
            className="flex-row items-center justify-center py-2 bg-red-50 rounded-lg active:bg-red-100"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Trash2 size={16} color="#EF4444" />
                <Text className="text-red-600 font-medium ml-2">Eliminar</Text>
              </>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default memo(AddressCard);
