import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onFinish?: () => void;
}

const LOGO = require("../../assets/images/ANCILOGO.png");

export default function LoadingScreen({
  onFinish,
}: SplashScreenProps) {


  const logoScale = useRef(new Animated.Value(0.88)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Color logo starts invisible.
  const colorLogoOpacity = useRef(new Animated.Value(0)).current;

  // Flashlight position.
  const flashPosition = useRef(new Animated.Value(-240)).current;

  // Flash opacity.
  const flashOpacity = useRef(new Animated.Value(0)).current;

  // Logo glow.
  const glowOpacity = useRef(new Animated.Value(0)).current;


  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(20)).current;

  // ============================================================
  // LOADING ANIMATION
  // ============================================================

  const loadingOpacity = useRef(new Animated.Value(0)).current;

  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  const loadingRotate = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    startSplashAnimation();
    startLoadingAnimation();

    const timer = setTimeout(() => {
      onFinish?.();
    }, 3500);

    return () => {
      clearTimeout(timer);
    };
  }, []);


  const startSplashAnimation = () => {


    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();



    setTimeout(() => {
      flashOpacity.setValue(0.85);
      flashPosition.setValue(-250);

      Animated.parallel([
        // Flash moves across logo
        Animated.timing(flashPosition, {
          toValue: 250,
          duration: 950,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        // Original color gradually appears
        Animated.timing(colorLogoOpacity, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        // Glow during flash
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 400,
            useNativeDriver: true,
          }),

          Animated.timing(glowOpacity, {
            toValue: 0,
            duration: 550,
            useNativeDriver: true,
          }),
        ]),

        // Flash fades
        Animated.sequence([
          Animated.delay(350),

          Animated.timing(flashOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 650);


    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1300);
  };


  const startLoadingAnimation = () => {
    const animateDot = (
      dot: Animated.Value,
      delay: number,
    ) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),

          Animated.timing(dot, {
            toValue: 1,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(dot, {
            toValue: 0.3,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.delay(250),
        ]),
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);

    // Rotating loading ring
    Animated.loop(
      Animated.timing(loadingRotate, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  const rotate = loadingRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>


      <View style={styles.backgroundGlow} />

      <View style={styles.topCircle} />

      <View style={styles.topCircleInner} />

      <View style={styles.leftArc} />

      <View style={styles.rightArc} />

      {/* Very subtle watermark */}
      <View style={styles.backgroundFigure}>
        <View style={styles.figureHead} />

        <View style={styles.figureBody} />

        <View style={styles.figureArmLeft} />

        <View style={styles.figureArmRight} />
      </View>

  

      <View style={styles.content}>

      

        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                {
                  scale: logoScale,
                },
              ],
            },
          ]}
        >

          {/* Glow behind logo */}
          <Animated.View
            style={[
              styles.logoGlow,
              {
                opacity: glowOpacity,
              },
            ]}
          />


          <Image
            source={LOGO}
            style={[
              styles.logo,
              styles.monochromeLogo,
            ]}
            resizeMode="contain"
          />


          <Animated.Image
            source={LOGO}
            style={[
              styles.logo,
              {
                opacity: colorLogoOpacity,
              },
            ]}
            resizeMode="contain"
          />

   

          <Animated.View
            pointerEvents="none"
            style={[
              styles.flashWrapper,
              {
                opacity: flashOpacity,
                transform: [
                  {
                    translateX: flashPosition,
                  },
                  {
                    rotate: "24deg",
                  },
                ],
              },
            ]}
          >
            <View style={styles.flashLight} />
          </Animated.View>

        </Animated.View>


        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: contentOpacity,
              transform: [
                {
                  translateY: contentTranslate,
                },
              ],
            },
          ]}
        >

          <Text style={styles.trainingTitle}>
            TRAIN. DEVELOP. ACHIEVE.
          </Text>

          <View style={styles.divider}>

            <View style={styles.dividerLine} />

            <Text style={styles.crown}>
              ♛
            </Text>

            <View style={styles.dividerLine} />

          </View>

          <Text style={styles.subtitle}>
            Empowering participants through training
          </Text>

        </Animated.View>

      </View>

      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: loadingOpacity,
          },
        ]}
      >

        {/* Rotating ring */}

        <View style={styles.loaderCircle}>

          <Animated.View
            style={[
              styles.loaderArc,
              {
                transform: [
                  {
                    rotate: rotate,
                  },
                ],
              },
            ]}
          />

          <View style={styles.loaderCenter}>
            <View style={styles.loaderCenterDot} />
          </View>

        </View>

        {/* Animated dots */}

        <View style={styles.dots}>

          <Animated.View
            style={[
              styles.dot,
              styles.navyDot,
              {
                opacity: dot1,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.dot,
              styles.goldDot,
              {
                opacity: dot2,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.dot,
              styles.redDot,
              {
                opacity: dot3,
              },
            ]}
          />

        </View>

        <Text style={styles.loadingText}>
          PREPARING TRAINING
        </Text>

      </Animated.View>

      {/* =====================================================
          BOTTOM DECORATION
      ====================================================== */}

      <View style={styles.bottomArea}>

        <View style={styles.bottomWaveOne} />

        <View style={styles.bottomWaveTwo} />

        <View style={styles.bottomGoldLine} />

        {/* Dot pattern */}

        <View style={styles.bottomDots}>

          {[...Array(12)].map((_, index) => (
            <View
              key={index}
              style={styles.smallDot}
            />
          ))}

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  // ==========================================================
  // BACKGROUND
  // ==========================================================

  backgroundGlow: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width,
    backgroundColor: "#F8FAFC",
    alignSelf: "center",
    top: height * 0.18,
    opacity: 0.8,
  },

  topCircle: {
    position: "absolute",
    width: width * 1.15,
    height: width * 1.15,
    borderRadius: width,
    borderWidth: 1,
    borderColor: "#EEF1F5",
    top: -width * 0.7,
    left: -width * 0.075,
  },

  topCircleInner: {
    position: "absolute",
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    top: -width * 0.48,
    left: width * 0.075,
  },

  leftArc: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#F1F3F6",
    left: -105,
    top: height * 0.28,
  },

  rightArc: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "#F0F2F5",
    right: -140,
    top: height * 0.45,
  },

  // ==========================================================
  // WATERMARK
  // ==========================================================

  backgroundFigure: {
    position: "absolute",
    width: width,
    height: 400,
    top: height * 0.10,
    alignItems: "center",
    opacity: 0.025,
  },

  figureHead: {
    width: 85,
    height: 85,
    borderRadius: 50,
    backgroundColor: "#0B2E52",
    position: "absolute",
    top: 25,
  },

  figureBody: {
    position: "absolute",
    width: 55,
    height: 230,
    backgroundColor: "#0B2E52",
    borderRadius: 40,
    transform: [
      {
        rotate: "8deg",
      },
    ],
    top: 90,
  },

  figureArmLeft: {
    position: "absolute",
    width: 210,
    height: 35,
    backgroundColor: "#0B2E52",
    borderRadius: 30,
    transform: [
      {
        rotate: "-17deg",
      },
    ],
    top: 120,
    left: 35,
  },

  figureArmRight: {
    position: "absolute",
    width: 210,
    height: 35,
    backgroundColor: "#0B2E52",
    borderRadius: 30,
    transform: [
      {
        rotate: "17deg",
      },
    ],
    top: 120,
    right: 35,
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: height * 0.08,
  },

  // ==========================================================
  // LOGO
  // ==========================================================

  logoContainer: {
    width: width * 0.68,
    height: width * 0.68,
    maxWidth: 300,
    maxHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: width,
  },

  logo: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  /*
   * This creates the BLACK/WHITE starting state.
   *
   * Because the original image is used with tintColor,
   * the colored logo becomes monochrome.
   */
  monochromeLogo: {
    tintColor: "#111827",
  },

  logoGlow: {
    position: "absolute",
    width: "85%",
    height: "85%",
    borderRadius: 200,
    backgroundColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOpacity: 1,
    shadowRadius: 35,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 15,
  },

  // ==========================================================
  // FLASHLIGHT
  // ==========================================================

  flashWrapper: {
    position: "absolute",
    width: 55,
    height: "150%",
    top: "-25%",
    justifyContent: "center",
    alignItems: "center",
  },

  flashLight: {
    width: 8,
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,

    shadowColor: "#FFFFFF",
    shadowOpacity: 1,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 20,
  },

  // ==========================================================
  // TEXT
  // ==========================================================

  textContainer: {
    alignItems: "center",
    marginTop: 24,
  },

  trainingTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 2.5,
    color: "#0B2E52",
    textAlign: "center",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 12,
  },

  dividerLine: {
    width: 65,
    height: 1,
    backgroundColor: "#D8A62A",
  },

  crown: {
    fontSize: 20,
    color: "#D8A62A",
    marginHorizontal: 12,
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    position: "absolute",
    bottom: height * 0.105,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  loaderCircle: {
    width: 42,
    height: 42,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E9EDF1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  loaderArc: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 30,
    borderWidth: 2,
    borderTopColor: "#0B2E52",
    borderRightColor: "#D8A62A",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },

  loaderCenter: {
    width: 18,
    height: 18,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  loaderCenterDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#D71920",
  },

  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 10,
  },

  navyDot: {
    backgroundColor: "#0B2E52",
  },

  goldDot: {
    backgroundColor: "#D8A62A",
  },

  redDot: {
    backgroundColor: "#D71920",
  },

  loadingText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#64748B",
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.1,
  },

  bottomWaveOne: {
    position: "absolute",
    width: width * 1.35,
    height: 95,
    borderRadius: 100,
    backgroundColor: "#F3F5F7",
    bottom: -55,
    left: -width * 0.2,
    transform: [
      {
        rotate: "-7deg",
      },
    ],
  },

  bottomWaveTwo: {
    position: "absolute",
    width: width * 1.3,
    height: 70,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#E6E9ED",
    bottom: -35,
    left: -width * 0.15,
    transform: [
      {
        rotate: "-7deg",
      },
    ],
  },

  bottomGoldLine: {
    position: "absolute",
    width: width * 0.75,
    height: 1,
    backgroundColor: "#D8A62A",
    bottom: 22,
    right: -width * 0.1,
    transform: [
      {
        rotate: "-7deg",
      },
    ],
  },

  bottomDots: {
    position: "absolute",
    left: 25,
    bottom: 18,
    width: 35,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },

  smallDot: {
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#DDE2E7",
  },
});