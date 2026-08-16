"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type {
  RegisterTrainerForm,
} from "@repo/types";

type TrainerRegistrationContextType = {
  form: Partial<RegisterTrainerForm>;

  updateForm: (
    values: Partial<RegisterTrainerForm>
  ) => void;

  clearForm: () => void;
};

const initialForm: Partial<RegisterTrainerForm> = {};

const TrainerRegistrationContext =
  createContext<TrainerRegistrationContextType | null>(
    null
  );

export function TrainerRegistrationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [form, setForm] =
    useState<Partial<RegisterTrainerForm>>(
      initialForm
    );

  function updateForm(
    values: Partial<RegisterTrainerForm>
  ) {
    setForm((previous) => ({
      ...previous,
      ...values,
    }));
  }

  function clearForm() {
    setForm({});
  }

  return (
    <TrainerRegistrationContext.Provider
      value={{
        form,
        updateForm,
        clearForm,
      }}
    >
      {children}
    </TrainerRegistrationContext.Provider>
  );
}

export function useTrainerRegistration() {
  const context = useContext(
    TrainerRegistrationContext
  );

  if (!context) {
    throw new Error(
      "useTrainerRegistration must be used inside TrainerRegistrationProvider"
    );
  }

  return context;
}