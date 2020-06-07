import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

import './styles.css';

const Success = () => {
    return (
        <div className="container">
            <div className="text">
                <FiCheckCircle size={150} color="#34CB79" />
            </div>
            <div>
                <p className="text-success">
                     Ponto cadastrado com sucesso!
                </p>
            </div>
        </div>
    )
}

export default Success;