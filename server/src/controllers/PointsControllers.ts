import { Request, Response } from 'express';
import connection from '../database/connection';

class PointsController {
    async index(req: Request, res: Response){
        const { city, uf, items } = req.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await connection('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.0.5:3333/uploads/${point.image}`,
            };
        });    

        return res.json(serializedPoints);
    }

    async show(req: Request, res: Response){
        const { id } = req.params;

        const point = await connection('points').where('id', id).first();

        if(!point) {
            return res.status(400).json({ message: 'Point not found.' });
        }
        
        const serializedPoint = {
            ...point,
            image_url: `http://192.168.0.5:3333/uploads/${point.image}`,
        }; 

        const items = await connection('items') //conecta na tabela items
            .join('point_items', 'items.id', '=', 'point_items.item_id') //relaciona com a tabela point_items e seleciona todos os id items da tabea items que também estão existentes na tabela point_items
            .where('point_items.point_id', id) //desta seleção é selecionado todos os items que tem o id do ponto de coleta solicitado
            .select('items.title');

        return res.json({ point: serializedPoint, items });
    }

    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body;
    
        const trx = await connection.transaction();
    
        const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        };

        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];

        const pointItems = items
            .split(',')
            .map((item: String) => Number(item.trim()))
            .map((item_id: number) => {
            return {
                item_id,
                point_id,
            };
        });
    
        await trx('point_items').insert(pointItems);
    
        await trx.commit();

        return res.json({ 
            id: point_id,
            ...point
         });
    }
}

export default PointsController;