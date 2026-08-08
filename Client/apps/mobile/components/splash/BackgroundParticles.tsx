import React from "react";

import {
  Dimensions,
  StyleSheet,
} from "react-native";

import Animated,{
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width,height }=Dimensions.get("window");

function Particle({

    size,

    left,

    top,

    delay,

}:{

    size:number;

    left:number;

    top:number;

    delay:number;

}){

    const translateY=useSharedValue(0);

    const opacity=useSharedValue(.25);

    React.useEffect(()=>{

        translateY.value=withRepeat(

            withTiming(

                -25,

                {

                    duration:2500+delay,

                    easing:Easing.inOut(Easing.sin)

                }

            ),

            -1,

            true

        );

        opacity.value=withRepeat(

            withTiming(

                .8,

                {

                    duration:1800+delay

                }

            ),

            -1,

            true

        );

    },[]);

    const style=useAnimatedStyle(()=>({

        opacity:opacity.value,

        transform:[

            {

                translateY:translateY.value

            }

        ]

    }));

    return(

        <Animated.View

            style={[

                styles.particle,

                style,

                {

                    width:size,

                    height:size,

                    borderRadius:size/2,

                    left,

                    top,

                }

            ]}

        />

    );

}

export default function BackgroundParticles(){

    return(

        <>

            <Particle

                size={12}

                left={40}

                top={120}

                delay={0}

            />

            <Particle

                size={18}

                left={300}

                top={160}

                delay={300}

            />

            <Particle

                size={10}

                left={90}

                top={380}

                delay={500}

            />

            <Particle

                size={14}

                left={250}

                top={520}

                delay={700}

            />

            <Particle

                size={8}

                left={170}

                top={640}

                delay={900}

            />

            <Particle

                size={16}

                left={width-70}

                top={height-150}

                delay={1000}

            />

        </>

    );

}

const styles=StyleSheet.create({

    particle:{

        position:"absolute",

        backgroundColor:"#6FD1D7",

        shadowColor:"#60A5FA",

        shadowRadius:20,

        shadowOpacity:.9,

        shadowOffset:{

            width:0,

            height:0

        },

        elevation:15,

    }

});