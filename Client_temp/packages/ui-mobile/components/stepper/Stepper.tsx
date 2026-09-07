import React from "react";

import {
  View,
} from "react-native";

import {

  Body,

  Title,

} from "../typography";

import { Step } from "./Step";

import { styles } from "./Stepper.styles";

import type {

  StepperProps,

} from "./Stepper.types";

export function Stepper({

  currentStep,

  totalSteps,

  title,

  subtitle,

  containerStyle,

}: StepperProps) {

  return (

    <View
      style={[
        styles.container,
        containerStyle,
      ]}
    >

      <View style={styles.header}>

        <Body>

          Step {currentStep} of {totalSteps}

        </Body>

        <Title style={styles.title}>

          {title}

        </Title>

        {subtitle && (

          <Body>

            {subtitle}

          </Body>

        )}

      </View>

      <View style={styles.indicatorContainer}>

        {Array.from({

          length: totalSteps,

        }).map((_, index) => (

          <Step

            key={index}

            active={index < currentStep}

          />

        ))}

      </View>

    </View>

  );

}