import React, { useEffect } from "react";

import {
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import Animated,{
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedGradient=Animated.createAnimatedComponent(LinearGradient);

export default function GradientBackground(){

    const opacity=useSharedValue(.2);

    useEffect(()=>{

        opacity.value=withRepeat(

            withTiming(

                .8,

                {

                    duration:5000,

                    easing:Easing.inOut(Easing.ease)

                }

            ),

            -1,

            true

        );

    },[]);

    const style=useAnimatedStyle(()=>({

        opacity:opacity.value

    }));

    return(

        <>

            <LinearGradient

                colors={[
    "#002B5C",
    "#0D2142",
    "#3B7597",
]}

                style={StyleSheet.absoluteFill}

            />

            <AnimatedGradient

                colors={[
    "#3B7597",
    "#6FD1D7",
    "#F7F9FB",
]}
                style={[

                    StyleSheet.absoluteFill,

                    style

                ]}

            />

        </>

    )

}