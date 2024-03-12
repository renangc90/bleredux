// App.js
import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DeviceModal from "./DeviceConnectionModal.js";
import { PulseIndicator } from "./PulseIndicator.js";
import useBLE from "./useBLE.js";
import { useDispatch, useSelector, Provider } from 'react-redux';
import { setHeartRate } from './redux/heartRateSlice';
import { store } from './redux/store.js';

const App = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();
  const heartRate = useSelector(state => state.heartRate.value);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  useEffect(() => {
    // Start streaming data on mount
    const device = connectedDevice;
    if (device) {
      startStreamingData(device);
    }

    // Stop streaming data on unmount
    return () => {
      if (device) {
        stopStreamingData(device);
      }
    };
  }, [connectedDevice]);

  const startStreamingData = async (device) => {
    if (device) {
      device.monitorCharacteristicForService(
        HEART_RATE_UUID,
        HEART_RATE_CHARACTERISTIC,
        onHeartRateUpdate
      );
    } else {
      console.log("No Device Connected");
    }
  };

  const stopStreamingData = async (device) => {
    if (device) {
      device.stopNotificationsForCharacteristic(
        HEART_RATE_UUID,
        HEART_RATE_CHARACTERISTIC
      );
    }
  };

  const onHeartRateUpdate = (error, characteristic) => {
    if (!error && characteristic?.value) {
      const rawData = base64.decode(characteristic.value);
      let innerHeartRate = -1;
      const firstBitValue = Number(rawData) & 0x01;
      if (firstBitValue === 0) {
        innerHeartRate = rawData[1].charCodeAt(0);
      } else {
        innerHeartRate = Number(rawData[1].charCodeAt(0) << 8) + Number(rawData[2].charCodeAt(2));
      }
      dispatch(setHeartRate(innerHeartRate));
    }
  };

  return (
    <Provider store={store}>
      <SafeAreaView style={styles.container}>
        <View style={styles.heartRateTitleWrapper}>
          {connectedDevice ? (
            <>
              <PulseIndicator />
              <Text style={styles.heartRateTitleText}>Your Heart Rate Is:</Text>
              <Text style={styles.heartRateText}>{heartRate} bpm</Text>
            </>
          ) : (
            <Text style={styles.heartRateTitleText}>
              Please Connect to a Heart Rate Monitor
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={connectedDevice ? disconnectFromDevice : openModal}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>
            {connectedDevice ? "Disconnect" : "Connect"}
          </Text>
        </TouchableOpacity>
        <DeviceModal
          closeModal={hideModal}
          visible={isModalVisible}
          connectToPeripheral={connectToDevice}
          devices={allDevices}
        />
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});

export default App;
