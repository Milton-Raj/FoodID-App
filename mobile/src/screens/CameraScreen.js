import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Zap, ZapOff } from 'lucide-react-native';
import { colors } from '../theme/colors';

export const CameraScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [flash, setFlash] = useState('off');
    const cameraRef = useRef(null);
    const insets = useSafeAreaInsets();

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                // Navigate to results with the photo URI
                navigation.navigate('Results', { photoUri: photo.uri });
            } catch (error) {
                Alert.alert('Error', 'Failed to take picture');
            }
        }
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="back" flash={flash} ref={cameraRef}>
                <View style={[styles.controlsContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>

                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <X color="white" size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                            {flash === 'on' ? <Zap color="#FFB300" size={24} /> : <ZapOff color="white" size={24} />}
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Bar */}
                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.captureButtonOuter} onPress={takePicture}>
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                    </View>

                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    button: {
        alignSelf: 'center',
        padding: 10,
        backgroundColor: colors.primary,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    camera: {
        flex: 1,
    },
    controlsContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomBar: {
        alignItems: 'center',
    },
    captureButtonOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'white',
    },
});
