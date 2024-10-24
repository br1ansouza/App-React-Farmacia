import React from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App'; 

type MapScreenRouteProp = RouteProp<RootStackParamList, 'MapScreen'>;

type Props = {
  route: MapScreenRouteProp;
};

export default function MapScreen({ route }: Props) {
  
  const { origem, destino } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: (origem.latitude + destino.latitude) / 2,
          longitude: (origem.longitude + destino.longitude) / 2,
          latitudeDelta: Math.abs(origem.latitude - destino.latitude) + 0.1,
          longitudeDelta: Math.abs(origem.longitude - destino.longitude) + 0.1,
        }}
      >
        {/* origem */}
        <Marker
          coordinate={{ latitude: origem.latitude, longitude: origem.longitude }}
          title={origem.nome}
          description="Origem"
        />

        {/* destino */}
        <Marker
          coordinate={{ latitude: destino.latitude, longitude: destino.longitude }}
          title={destino.nome}
          description="Destino"
        />

        {/* Gambiarra - desenha uma linha reta entre origem e destino kkkkkkkkkk */}
        <Polyline
          coordinates={[
            { latitude: origem.latitude, longitude: origem.longitude },
            { latitude: destino.latitude, longitude: destino.longitude }
          ]}
          strokeColor="blue" 
          strokeWidth={4}     
        />
      </MapView>
    </View>
  );
}
