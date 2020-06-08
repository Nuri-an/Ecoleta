import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

import Dropzone from '../../components/Dropzone';
import Success from '../../components/Sucesso';

import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import * as yup from 'yup';

import api from '../../services/api';
import axios from 'axios';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEInitials {
    sigla: string;
}

interface IBGECity {
    nome: string;
}

const CreatedPoint = () => {
    const Validation = yup.object().shape({
        name: yup
            .string()
            .required(),
        email: yup
            .string()
            .email()
            .required(),
        whatsapp: yup
            .string()
            .required(),
        uf: yup
            .string()
            .max(2)
            .min(2)
            .required(),
        city: yup
            .string()
            .required(),
        latitude: yup
            .number()
            .required(),
        longitude: yup
            .number()
            .required(),
        items: yup
            .array()
            .required(),
    });


    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [errorForm, setErrorForm] = useState('1');

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([latitude, longitude]);

            //console.log(position);
        })
    }, []);

    useEffect(() => {
        api.get('items').then(res => {
            setItems(res.data);
        });
    }, []);

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

    
    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectedUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;

        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({ ...formData, [name]: value });
    }

    function handleSelectedItem(id: number) {
        const alredySelected = selectedItems.findIndex(item => item === id);

        if (alredySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);

            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));

        if (selectedFile) {
            data.append('image', selectedFile);
        }

        Validation.isValid({ 
            name: name,
            email: email,
            whatsapp: whatsapp,
            uf: uf, 
            city: city, 
            latitude: latitude,
            longitude: longitude,
            items: items
        })
        .then( async valid => {
            if(valid){
                setErrorForm('1'); 

                await api.post('points', data);

                setErrorForm('10');

                setTimeout(() => {
                    history.push('/');
                }, 3000);

            }else{
                setErrorForm('0'); 
                console.log(name);   
            }
        });


    }

    return (
        <>
        <div id="page-create-point">

            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft /> Voltar para Home
                </Link>
            </header>

            <form onSubmit={handleSubmit} >
                <h1>Cadastro de <br /> ponto de coleta </h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2> Dados </h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name"> Nome da entidade </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email"> E-mail </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatasapp"> Whatasapp </label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2> Endereço </h2>
                        <span> Selecone o endereço no mapa </span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf"> Estados (UF) </label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUF}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city"> Cidade </label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2> Ítens de coleta </h2>
                        <span> Selecone um ou mais itens abaixo </span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id}
                                onClick={() => handleSelectedItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                <img src={item.image_url} alt={item.title} />
                                <span> {item.title} </span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <div style={ (errorForm !== '0') ? {display: 'none'} : {marginTop: 50} }>
                    <p style={{color: 'red'}}> <FiAlertCircle />  Por favor, preencha todos os campos corretamente. </p>
                </div>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
        <div  style={ (errorForm === '10') ? {} : {display: 'none'} }>
            <Success />
        </div>
        </>
    );
}

export default CreatedPoint;