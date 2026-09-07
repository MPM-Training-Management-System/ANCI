import React from "react";

import {
  useLocalSearchParams,
} from "expo-router";

import ModuleReader from "@/components/learning/ModuleReader";

type Params = {
  materialId?: string | string[];
  moduleId?: string | string[];
  moduleIndex?: string | string[];
};

export default function LearningModuleRoute() {

  const params =
    useLocalSearchParams<Params>();

  const materialId =
    Array.isArray(params.materialId)
      ? params.materialId[0]
      : params.materialId;

  const moduleId =
    Array.isArray(params.moduleId)
      ? params.moduleId[0]
      : params.moduleId;

  const moduleIndex =
    Array.isArray(params.moduleIndex)
      ? params.moduleIndex[0]
      : params.moduleIndex;

  if (
    !materialId ||
    !moduleId
  ) {
    return null;
  }

  return (
    <ModuleReader
      materialId={materialId}
      moduleId={moduleId}
      moduleIndex={
        Number(moduleIndex ?? 0)
      }
    />
  );
}