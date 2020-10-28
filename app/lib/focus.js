import { useFocusEffect } from "@react-navigation/native";
import React from "react";

export default function FocusEffect({ onFocus, onFocusRemoved }) {
  useFocusEffect(
    React.useCallback(() => {
      onFocus();
      return () => onFocusRemoved();
    }, [onFocus, onFocusRemoved]),
  );
  return null;
}