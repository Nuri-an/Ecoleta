import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native'
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import api from '../../services/api';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Point {
  id: number;
  image: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface Params {
  selectedUf: string;
  selectedCity: string;
}

const Points = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;
  

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, [])

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();

      if(status !== 'granted') {
        Alert.alert('Oooooops....', 'Precisamos e sua permisão para obter a localização.');
        return;
      }

      const location = await Location.getCurrentPositionAsync();

      const { latitude, longitude } = location.coords;
      
      setInitialPosition([
        latitude, 
        longitude
      ])
    }
    loadPosition()
  }, [])

  useEffect(() => {
    api.get('points', {
      params: {
        city: routeParams.selectedCity,
        uf: routeParams.selectedUf,
        items: selectedItems
      }
    }).then(response => {
      setPoints(response.data);
    })
  }, [selectedItems]);

  function handleNavigateBack() {
    navigation.goBack();
  }

  function handleNavigateToDetail(id: number) {
    navigation.navigate('Detail', { point_id: id });
  }

  function handleSelectedItem(id: number){
    const alredySelected = selectedItems.findIndex(item => item === id);

    if (alredySelected >= 0){
        const filteredItems = selectedItems.filter(item => item !== id);

        setSelectedItems(filteredItems);
    }else{
        setSelectedItems([ ...selectedItems, id]);
    }
}

  return (
    <>
      <View style={styles.container}>

        <TouchableOpacity onPress={handleNavigateBack}>
          <Feather name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}> Bem Vindo. </Text>
        <Text style={styles.description}> Encontre no mapa um ponto de coleta. </Text>

        <View style={styles.mapContainer}>
         { initialPosition[0] !== 0 && (
             <MapView
             style={styles.map}
            initialRegion={{
               latitude: initialPosition[0],
               longitude: initialPosition[1],
               latitudeDelta: 0.014,
               longitudeDelta: 0.014,
             }}
           >
             {points.map(point => (
               <Marker
               key={String(point.id)}
               style={styles.mapMarker}
               onPress={() => handleNavigateToDetail(point.id)}
               coordinate={{
                 latitude: point.latitude,
                 longitude: point.longitude,
               }}
             >
               <View style={styles.mapMarkerContainer}>
                 <Image style={styles.mapMarkerImage} source={{ uri: point.image }} />
                 <Text style={styles.mapMarkerTitle}> {point.name} </Text>
               </View>
               <View style={styles.mapMarkerContainerIcon}>
                 <Text style={styles.mapMarkerIcon}>
                   <FontAwesome name="caret-down" size={50} color="#34CB79" />
                 </Text>
               </View>
             </Marker>
             ))}
 
           </MapView>
         )}
        </View>

      </View>

      <View style={styles.itemsContainer}>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {items.map(item => (
            <TouchableOpacity 
              key={String(item.id)} 
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {}
              ]} 
              onPress={() => handleSelectedItem(item.id)}
              activeOpacity={0.6}
            >
            <SvgUri width={42} height={42} uri={item.image_url} />
            <Text style={styles.itemTitle}> {item.title} </Text>
          </TouchableOpacity>
          ))}

          
        </ScrollView>

      </View>
    </>
  )

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 150,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  mapMarkerContainerIcon: {
    width: 90,
    height: 40,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: -20
  },

  mapMarkerIcon: {
    flex: 1,
  },


  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points;