import {
  useRef,
  useState,
} from "react";

import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import * as ImagePicker from "expo-image-picker";

import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
  value?: string;
  onChange: (uri: string) => void;
  disabled?: boolean;
}

type FlashMode =
  | "off"
  | "auto"
  | "screen";

export default function ProfilePhotoPicker({
  value,
  onChange,
  disabled = false,
}: Props) {
  // =====================================================
  // CAMERA PERMISSION
  // =====================================================

  const [permission, requestPermission] =
    useCameraPermissions();

  // =====================================================
  // CAMERA STATE
  // =====================================================

  const [cameraVisible, setCameraVisible] =
    useState(false);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [takingPhoto, setTakingPhoto] =
    useState(false);

  // =====================================================
  // FLASH
  // =====================================================

  const [flash, setFlash] =
    useState<FlashMode>("auto");

  // =====================================================
  // GALLERY STATE
  // =====================================================

  const [pickingImage, setPickingImage] =
    useState(false);

  // =====================================================
  // CAMERA REF
  // =====================================================

  const cameraRef =
    useRef<CameraView | null>(null);

  // =====================================================
  // OPEN CAMERA
  // =====================================================

  const handleOpenCamera = async () => {
    if (disabled || takingPhoto) {
      return;
    }

    try {
      if (!permission) {
        return;
      }

      // Request camera permission

      if (!permission.granted) {
        const result =
          await requestPermission();

        if (!result.granted) {
          Alert.alert(
            "Camera Permission Required",
            "Please allow camera access to take your profile photo."
          );

          return;
        }
      }

      setCameraReady(false);

      setCameraVisible(true);

    } catch (error) {
      console.error(
        "OPEN CAMERA ERROR:",
        error
      );

      Alert.alert(
        "Camera Error",
        "Unable to open the camera."
      );
    }
  };

  // =====================================================
  // OPEN GALLERY
  // =====================================================

  const handleOpenGallery = async () => {
    if (
      disabled ||
      pickingImage ||
      takingPhoto
    ) {
      return;
    }

    try {
      setPickingImage(true);

      // =================================================
      // REQUEST PHOTO LIBRARY PERMISSION
      // =================================================

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        !permissionResult.granted
      ) {
        Alert.alert(
          "Photo Permission Required",
          "Please allow access to your photos so you can choose a profile picture."
        );

        return;
      }

      // =================================================
      // OPEN PHOTO LIBRARY
      // =================================================

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],

          allowsEditing: true,

          aspect: [1, 1],

          quality: 0.85,

          selectionLimit: 1,
        });

      // =================================================
      // USER CANCELLED
      // =================================================

      if (result.canceled) {
        return;
      }

      // =================================================
      // GET SELECTED IMAGE
      // =================================================

      const selectedAsset =
        result.assets?.[0];

      if (!selectedAsset?.uri) {
        Alert.alert(
          "Photo Error",
          "Unable to get the selected photo."
        );

        return;
      }

      console.log(
        "GALLERY PHOTO:",
        selectedAsset.uri
      );

      console.log(
        "PHOTO SIZE:",
        selectedAsset.width,
        "x",
        selectedAsset.height
      );

      // =================================================
      // SEND IMAGE TO PARENT
      // =================================================

      onChange(
        selectedAsset.uri
      );

    } catch (error) {
      console.error(
        "OPEN GALLERY ERROR:",
        error
      );

      Alert.alert(
        "Photo Error",
        "Unable to select a photo from your gallery."
      );

    } finally {
      setPickingImage(false);
    }
  };

  // =====================================================
  // CLOSE CAMERA
  // =====================================================

  const handleCloseCamera = () => {
    if (takingPhoto) {
      return;
    }

    setCameraVisible(false);

    setCameraReady(false);
  };

  // =====================================================
  // TOGGLE FLASH
  // =====================================================

  const handleToggleFlash = () => {
    setFlash((current) => {
      // AUTO → SCREEN

      if (current === "auto") {
        return "screen";
      }

      // SCREEN → OFF

      if (current === "screen") {
        return "off";
      }

      // OFF → AUTO

      return "auto";
    });
  };

  // =====================================================
  // FLASH LABEL
  // =====================================================

  const getFlashLabel = () => {
    if (flash === "auto") {
      return "AUTO";
    }

    if (flash === "screen") {
      return "SCREEN";
    }

    return "OFF";
  };

  // =====================================================
  // TAKE PHOTO
  // =====================================================

  const handleTakePhoto = async () => {
    if (
      !cameraRef.current ||
      !cameraReady ||
      takingPhoto
    ) {
      return;
    }

    try {
      setTakingPhoto(true);

      console.log(
        "================================"
      );

      console.log(
        "TAKING PROFILE PHOTO"
      );

      console.log(
        "FLASH:",
        flash
      );

      // =================================================
      // TAKE PHOTO
      // =================================================

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.85,

          skipProcessing: false,
        });

      // =================================================
      // VALIDATE
      // =================================================

      if (!photo?.uri) {
        Alert.alert(
          "Camera Error",
          "Unable to capture the photo."
        );

        return;
      }

      console.log(
        "PROFILE PHOTO URI:",
        photo.uri
      );

      console.log(
        "PHOTO SIZE:",
        photo.width,
        "x",
        photo.height
      );

      // =================================================
      // SEND TO PARENT
      // =================================================

      onChange(photo.uri);

      // =================================================
      // CLOSE CAMERA
      // =================================================

      setCameraVisible(false);

      setCameraReady(false);

    } catch (error) {
      console.error(
        "TAKE PHOTO ERROR:",
        error
      );

      Alert.alert(
        "Camera Error",
        "Unable to take your profile photo. Please try again."
      );

    } finally {
      setTakingPhoto(false);
    }
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <View style={styles.container}>

      {/* =================================================
          LABEL
      ================================================= */}

      <Text style={styles.label}>
        Profile Photo
      </Text>

      {/* =================================================
          PHOTO SECTION
      ================================================= */}

      <View style={styles.photoSection}>

        {/* =================================================
            PHOTO PREVIEW
        ================================================= */}

        <View
          style={styles.avatarContainer}
        >
          {value ? (
            <Image
              source={{
                uri: value,
              }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View
              style={styles.placeholder}
            >
              <Ionicons
                name="person-outline"
                size={52}
                color="#94A3B8"
              />
            </View>
          )}
        </View>

        {/* =================================================
            TITLE
        ================================================= */}

        <Text style={styles.title}>
          {value
            ? "Profile photo added"
            : "Add your profile photo"}
        </Text>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <Text
          style={styles.description}
        >
          {value
            ? "Make sure your face is clearly visible in the photo."
            : "Take a clear photo or choose an existing photo from your gallery."}
        </Text>

        {/* =================================================
            TAKE PHOTO
        ================================================= */}

        <Pressable
          disabled={
            disabled ||
            pickingImage
          }
          onPress={
            handleOpenCamera
          }
          style={[
            styles.optionButton,
            styles.cameraButton,
            (disabled ||
              pickingImage) &&
              styles.buttonDisabled,
          ]}
        >
          <View
            style={styles.buttonIcon}
          >
            <Ionicons
              name="camera-outline"
              size={21}
              color="#FFFFFF"
            />
          </View>

          <View
            style={styles.buttonContent}
          >
            <Text
              style={
                styles.optionButtonTitle
              }
            >
              {value
                ? "Retake Photo"
                : "Take Profile Photo"}
            </Text>

            <Text
              style={
                styles.optionButtonSubtitle
              }
            >
              Use your camera
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>

        {/* =================================================
            GALLERY
        ================================================= */}

        <Pressable
          disabled={
            disabled ||
            pickingImage
          }
          onPress={
            handleOpenGallery
          }
          style={[
            styles.optionButton,
            styles.galleryButton,
            (disabled ||
              pickingImage) &&
              styles.buttonDisabled,
          ]}
        >
          <View
            style={
              styles.galleryIcon
            }
          >
            <Ionicons
              name="images-outline"
              size={21}
              color="#2563EB"
            />
          </View>

          <View
            style={styles.buttonContent}
          >
            <Text
              style={
                styles.galleryButtonTitle
              }
            >
              {pickingImage
                ? "Opening Gallery..."
                : "Choose from Gallery"}
            </Text>

            <Text
              style={
                styles.galleryButtonSubtitle
              }
            >
              Select an existing photo
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#2563EB"
          />
        </Pressable>

      </View>

      {/* =================================================
          FULL SCREEN CAMERA
      ================================================= */}

      <Modal
        visible={cameraVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={
          handleCloseCamera
        }
      >
        <View
          style={styles.cameraScreen}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <View
            style={styles.cameraHeader}
          >

            {/* CLOSE */}

            <Pressable
              onPress={
                handleCloseCamera
              }
              disabled={takingPhoto}
              style={
                styles.closeButton
              }
            >
              <Ionicons
                name="close"
                size={30}
                color="#FFFFFF"
              />
            </Pressable>

            {/* TITLE */}

            <Text
              style={styles.cameraTitle}
            >
              Profile Photo
            </Text>

            {/* FLASH */}

            <Pressable
              onPress={
                handleToggleFlash
              }
              disabled={takingPhoto}
              style={
                styles.flashButton
              }
            >
              <Ionicons
                name={
                  flash === "off"
                    ? "flash-off"
                    : "flash"
                }
                size={22}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.flashLabel
                }
              >
                {getFlashLabel()}
              </Text>
            </Pressable>

          </View>

          {/* =================================================
              LIVE CAMERA
          ================================================= */}

          <View
            style={
              styles.cameraPreviewWrapper
            }
          >

            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
              mode="picture"
              zoom={0}
              mirror={true}
              flash={flash}
              autofocus="on"
              onCameraReady={() => {
                console.log(
                  "CAMERA READY"
                );

                setCameraReady(true);
              }}
            />

            {/* =================================================
                FACE GUIDE
            ================================================= */}

            <View
              pointerEvents="none"
              style={styles.faceGuide}
            >
              <View
                style={
                  styles.faceGuideInner
                }
              />
            </View>

          </View>

          {/* =================================================
              BOTTOM
          ================================================= */}

          <View
            style={styles.cameraBottom}
          >

            <Text
              style={styles.cameraHint}
            >
              Position your face inside{"\n"}
              the frame
            </Text>

            {/* CAPTURE */}

            <Pressable
              disabled={
                !cameraReady ||
                takingPhoto
              }
              onPress={
                handleTakePhoto
              }
              style={[
                styles.captureButton,
                (!cameraReady ||
                  takingPhoto) &&
                  styles.captureButtonDisabled,
              ]}
            >
              <View
                style={
                  styles.captureInner
                }
              />
            </Pressable>

          </View>

          {/* =================================================
              LOADING
          ================================================= */}

          {!cameraReady && (
            <View
              style={
                styles.loadingOverlay
              }
              pointerEvents="none"
            >
              <Text
                style={
                  styles.loadingText
                }
              >
                Starting camera...
              </Text>
            </View>
          )}

        </View>
      </Modal>

    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // ===================================================
  // MAIN
  // ===================================================

  container: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
  },

  // ===================================================
  // PHOTO SECTION
  // ===================================================

  photoSection: {
    alignItems: "center",
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: "hidden",
    marginBottom: 18,
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: 65,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 20,
  },

  // ===================================================
  // OPTION BUTTONS
  // ===================================================

  optionButton: {
    width: "100%",
    minHeight: 64,
    borderRadius: 16,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 10,

    marginTop: 10,
  },

  // ===================================================
  // CAMERA BUTTON
  // ===================================================

  cameraButton: {
    backgroundColor: "#2563EB",
  },

  // ===================================================
  // GALLERY BUTTON
  // ===================================================

  galleryButton: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  // ===================================================
  // ICON
  // ===================================================

  buttonIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,

    backgroundColor:
      "rgba(255,255,255,0.18)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  galleryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,

    backgroundColor: "#DBEAFE",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  // ===================================================
  // BUTTON CONTENT
  // ===================================================

  buttonContent: {
    flex: 1,
  },

  optionButtonTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },

  optionButtonSubtitle: {
    color: "#DBEAFE",
    fontSize: 12,
  },

  galleryButtonTitle: {
    color: "#1E3A8A",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },

  galleryButtonSubtitle: {
    color: "#64748B",
    fontSize: 12,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  // ===================================================
  // CAMERA SCREEN
  // ===================================================

  cameraScreen: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "space-between",
  },

  // ===================================================
  // HEADER
  // ===================================================

  cameraHeader: {
    paddingTop: 55,
    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    zIndex: 10,
  },

  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,

    backgroundColor:
      "rgba(0,0,0,0.50)",

    justifyContent: "center",
    alignItems: "center",
  },

  cameraTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",

    textShadowColor:
      "rgba(0,0,0,0.5)",

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 3,
  },

  // ===================================================
  // FLASH
  // ===================================================

  flashButton: {
    minWidth: 58,
    height: 46,
    borderRadius: 23,

    paddingHorizontal: 8,

    backgroundColor:
      "rgba(0,0,0,0.50)",

    justifyContent: "center",
    alignItems: "center",
  },

  flashLabel: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "700",
    marginTop: 1,
  },

  // ===================================================
  // CAMERA PREVIEW
  // ===================================================

  cameraPreviewWrapper: {
    width: "100%",

    aspectRatio: 3 / 4,

    alignSelf: "center",

    position: "relative",

    overflow: "hidden",

    backgroundColor: "#000000",
  },

  camera: {
    ...StyleSheet.absoluteFillObject,
  },

  // ===================================================
  // FACE GUIDE
  // ===================================================

  faceGuide: {
    position: "absolute",

    alignSelf: "center",

    top: "18%",

    width: "62%",

    aspectRatio: 0.76,

    borderWidth: 3,

    borderColor: "#FFFFFF",

    borderRadius: 999,

    justifyContent: "center",

    alignItems: "center",
  },

  faceGuideInner: {
    width: "94%",
    height: "94%",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.45)",

    borderRadius: 999,
  },

  // ===================================================
  // BOTTOM
  // ===================================================

  cameraBottom: {
    alignItems: "center",

    paddingBottom: 45,

    paddingTop: 20,
  },

  cameraHint: {
    color: "#FFFFFF",

    fontSize: 14,

    lineHeight: 20,

    marginBottom: 20,

    textAlign: "center",

    textShadowColor:
      "rgba(0,0,0,0.6)",

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 3,
  },

  // ===================================================
  // CAPTURE BUTTON
  // ===================================================

  captureButton: {
    width: 82,
    height: 82,

    borderRadius: 41,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 4,

    borderColor:
      "rgba(255,255,255,0.55)",
  },

  captureButtonDisabled: {
    opacity: 0.5,
  },

  captureInner: {
    width: 66,
    height: 66,

    borderRadius: 33,

    backgroundColor: "#2563EB",
  },

  // ===================================================
  // LOADING
  // ===================================================

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      "rgba(0,0,0,0.35)",

    justifyContent: "center",
    alignItems: "center",

    zIndex: 20,
  },

  loadingText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});