import React, { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, ImageBackground, Text, View, Image, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

import axios from 'axios';
//import styles from './styles';

interface IBGEInitials {
  sigla: string;
}

interface IBGECity {
  nome: string;
}
const Home = () => {
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [errorForm, setErrorForm] = useState('1');

  const navigation = useNavigation();

  useEffect(() => {
    axios.get<IBGEInitials[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(res => {
      const ufInitials = res.data.map(uf => uf.sigla);

      setUfs(ufInitials);
    });
  }, []);


  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }
    axios.get<IBGECity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
      const cityName = res.data.map(city => city.nome);

      setCities(cityName);
    });
  }, [selectedUf]);


  function HandleNavigationToPoint() {
    setErrorForm('1');
    navigation.navigate('Points',{
      selectedUf,
      selectedCity
    });
  }



  return (
    <ImageBackground source={require('../../assets/home-background.png')}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >

      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}> Seu marketplace de coleta de resíduos. </Text>
        <Text style={styles.description}> Ajudamos pessoas a encontrarem pontos de cleta de forma eficiente. </Text>
      </View>

      <View style={styles.select}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedUf(value)}
          placeholder={{
            label: 'Seleione uma UF',
            value: '0',
          }}
          items={
            ufs.map(uf => (
              { label: uf, value: uf, itemKey: uf }
            ))
          }
        />
      </View>
      <View style={styles.select}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedCity(value)}
          placeholder={{
            label: 'Seleione uma cidade',
            value: '0',
          }}
          items={
            cities.map(city => (
              { label: city, value: city, itemKey: city }
            ))
          }
        />
      </View>

      <View style={(errorForm === '0') ? styles.errorContainer : { display: 'none'}}>
        <Text style={styles.errorText}>
        Por favor, selecione sua UF e cidade antes de prosseguir
        </Text>
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={() => ((selectedCity !== '0') && (selectedUf !== '0')) ? HandleNavigationToPoint() : setErrorForm('0')}>
          <View style={styles.buttonIcon}>
            <Text>
              <Feather name="arrow-right" color="#FFF" size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>
            Entrar
            </Text>
        </RectButton>
      </View>

    </ImageBackground>

  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  imageLogo: {
    marginTop: 20,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 24,
    fontSize: 16,
    height: 60,
    backgroundColor: '#FFF',
  },

  errorContainer: {
    paddingVertical: 5,
  },
  
  errorText: {
    color: 'red',

  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    backgroundColor: 'white',
    color: 'black',
  },
});

export default Home;