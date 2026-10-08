import React, { useEffect } from "react";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import LearningScreen from "@/components/learning/LearningScreen";

type Params = {
  materialId?: string | string[];
};

export default function LearningMaterialRoute() {
  const params = useLocalSearchParams<Params>();

  const materialId = Array.isArray(params.materialId)
    ? params.materialId[0]
    : params.materialId;

  useEffect(() => {
    if (!materialId) {
      router.back();
    }
  }, [materialId]);

  if (!materialId) {
    return null;
  }

  return <LearningScreen />;
}