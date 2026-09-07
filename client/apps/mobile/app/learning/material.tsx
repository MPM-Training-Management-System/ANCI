import React from "react";

import {
  useLocalSearchParams,
  router,
} from "expo-router";

import LearningMaterialModules from "@/components/learning/material";

type Params = {
  materialId?: string | string[];
  completedModuleId?: string | string[];
};

export default function LearningMaterialRoute() {
  const params =
    useLocalSearchParams<Params>();

  const materialId =
    Array.isArray(params.materialId)
      ? params.materialId[0]
      : params.materialId;

  const completedModuleId =
    Array.isArray(params.completedModuleId)
      ? params.completedModuleId[0]
      : params.completedModuleId;

  if (!materialId) {
    router.back();
    return null;
  }

  return (
    <LearningMaterialModules
      materialId={materialId}
      completedModuleId={
        completedModuleId
      }
    />
  );
}