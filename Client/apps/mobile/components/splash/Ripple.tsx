import React,{ useEffect } from "react";

import {
    StyleSheet,
} from "react-native";

import Animated,{
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";

export default function Ripple(){

    const scale=useSharedValue(.2);

    const opacity=useSharedValue(.5);

    useEffect(()=>{

        scale.value=withRepeat(

            withTiming(

                2.6,

                {

                    duration:2500,

                    easing:Easing.out(Easing.ease)

                }

            ),

            -1,

            false

        );

        opacity.value=withRepeat(

            withTiming(

                0,

                {

                    duration:2500

                }

            ),

            -1,

            false

        );

    },[]);

    const style=useAnimatedStyle(()=>({

        opacity:opacity.value,

        transform:[

            {

                scale:scale.value

            }

        ]

    }));

    return(

        <Animated.View

            style={[

                styles.circle,

                style

            ]}

        />

    )

}

const styles=StyleSheet.create({

    circle:{

        position:"absolute",

        width:180,

        height:180,

        borderRadius:90,

        borderWidth:2,

        borderColor:"rgba(111,209,215,.45)"

    }

});