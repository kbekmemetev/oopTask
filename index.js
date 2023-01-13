const path = require('path') // подключаем стандартный пакет NodeJS для работы с путями
const csv = require('csvtojson') // подключаем пакет для конвертации csv в json

const formAdaptedArray = async (csvFilePath) => { // функция для преобразования файла в json и обработки полей вакансий
    let jsonArray = await csv().fromFile(csvFilePath) // получаем json файл для удобства работы
    for (let vacancy of jsonArray) { // цикл по всем вакансиям
        for (let key in vacancy){ // цикл по всем ключам объекта вакансии
            if (!vacancy[key]) { // если значение - поля пустая, 
                delete vacancy[key] // удаляем поле из объекта
                continue // прыгаем на следующую итерацию
            }
            vacancy[key] = vacancy[key].split('\n').join(', ') // разделяем строку на массив по \n, а затем соединяем обратно в строку через запятую с пробелом
            vacancy[key] = vacancy[key].replace(/\s+/g, ' ').trim() // ищем любое количество пробелов подряд и заменяем их единичным пробелом
            // после чего с помощью .trim() убираем пробелы с конца и начала строки
            vacancy[key] = vacancy[key].replace(/<\/?[^>]+(>|$)/g, ''); // с помощью регулярного выражения убираем все html тэги
        }
    }

    return jsonArray // возвращаем обработанный массив
}

const output = (array) => { // функция вывода в консоль
    for (const vacancy of array) { // цикл по всем элементам массива
        for (const key in vacancy){ // цикл по всем ключам в объекте
            console.log(`${key}: ${vacancy[key]}`) // выводим консоль информацию в формате "key: value"
        }
        console.log() // добавляем пустую стоку после каждой вакансии
    }
}

const main = async (filePath) => { // нельзя нормально работать с асинхронными функциями в основном окне, поэтому объявляем вспомогательную фунцию
    const array = await formAdaptedArray(filePath) // получаем обработанный массив из первой функции
    return output(array) // вызываем функцию вывода с полученным массивом
}

const filePath = path.resolve(__dirname, 'vacancies.csv') // получаем абсолютный путь до csv файла
main(filePath) // вызываем все вместе