import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function Results() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 gap-4">
      <View className="w-16 h-16 rounded-full bg-brand-blue/10 items-center justify-center">
        <Ionicons name="bar-chart" size={30} color="#2452FF" />
      </View>
      <Text className="text-gray-900 dark:text-white text-xl font-bold">
        Results
      </Text>
      <Text className="text-gray-400 dark:text-gray-500 text-sm text-center px-8">
        Your exam results and performance analytics will appear here.
      </Text>
    </View>
  );
}
