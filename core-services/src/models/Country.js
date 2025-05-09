import db from '../config/db.js';

export const createCountry = (countryData) => {
    return new Promise(async (resolve, reject) => {
        const { cca2, common_name, official_name } = countryData;
        console.log(cca2, common_name, official_name)

        db.run(
            'INSERT INTO countries (id, common_name, official_name) VALUES (?, ?, ?)',
            [cca2, common_name, official_name],
            function(err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            }
        )
    });
};

export const getCountries = () => {

    return new Promise(async (resolve, reject) => {
        db.all(
            'SELECT id, common_name, official_name FROM countries',
            (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            }
        )
    });
    
};