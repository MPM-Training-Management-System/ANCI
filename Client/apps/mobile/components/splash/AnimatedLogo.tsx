import React, { useEffect } from "react";

import {
  Image,
  StyleSheet,
} from "react-native";

import Animated,{
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function AnimatedLogo(){

    const translateY=useSharedValue(-350);

    const scale=useSharedValue(.5);

    const rotate=useSharedValue(-25);

    const glow=useSharedValue(.3);

    useEffect(()=>{

        translateY.value=withSequence(

            withTiming(

                20,

                {
                    duration:900,
                    easing:Easing.out(Easing.exp)
                }

            ),

            withSpring(

                0,

                {
                    damping:7,
                    stiffness:130,
                }

            )

        );

        scale.value=withSequence(

            withTiming(

                1.18,

                {
                    duration:900,
                }

            ),

            withSpring(1)

        );

        rotate.value=withTiming(

            0,

            {
                duration:1000,
            }

        );

        glow.value=withSequence(

            withTiming(

                1,

                {
                    duration:800,
                }

            ),

            withTiming(

                .45,

                {
                    duration:700,
                }

            )

        );

    },[]);

    const animatedStyle=useAnimatedStyle(()=>({

        opacity:glow.value,

        transform:[

            {
                translateY:translateY.value
            },

            {
                scale:scale.value
            },

            {
                rotate:`${rotate.value}deg`
            }

        ]

    }));

    return(

        <Animated.View

            style={[

                styles.container,

                animatedStyle

            ]}

        >

            <Image

                source={require("../../assets/images/ANCILOGO.png")}

                style={styles.logo}

            />

        </Animated.View>

    )

}

const styles=StyleSheet.create({

    container:{

        width:170,

        height:170,

        borderRadius:85,

        justifyContent:"center",

        alignItems:"center",

        backgroundColor:"rgba(255,255,255,.18)",

        borderWidth:1,

        borderColor:"rgba(255,255,255,.25)",

        shadowColor:"#6FD1D7",

        shadowRadius:35,

        shadowOpacity:.9,

        shadowOffset:{

            width:0,

            height:0

        },

        elevation:20,

    },

    logo:{

         width:180,

    height:180,

    borderRadius:90,

    justifyContent:"center",

    alignItems:"center",

    backgroundColor:"rgba(255,255,255,.18)",

    borderWidth:1,

    borderColor:"rgba(255,255,255,.25)",

    shadowColor:"#6FD1D7",

    shadowOpacity:1,

    shadowRadius:45,

    shadowOffset:{
        width:0,
        height:0,
    },

    elevation:40,

    zIndex:999,

    }

});