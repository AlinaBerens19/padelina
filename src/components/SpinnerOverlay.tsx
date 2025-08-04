import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSpinnerStore } from "../store/spinnerStore";

const SpinnerOverlay = () => {
  const { visible, text } = useSpinnerStore();
  if (!visible) return null;
  return (
    <View style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(255,255,255,0.7)",
      justifyContent: "center", alignItems: "center", zIndex: 100,
    }}>
      <ActivityIndicator size="large" color="#1ba158" />
      <Text style={{ marginTop: 12, color: "#1ba158", fontWeight: "500" }}>{text || "Загрузка..."}</Text>
    </View>
  );
};

export default SpinnerOverlay;
