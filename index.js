const path = require('path') // подключаем стандартный пакет NodeJS для работы с путями
const csv = require('csvtojson') // подключаем пакет для конвертации csv в json
const translations = require('./translations') // подключаем модуль с переводами из файла translation.js

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
            console.log(`${translations[key]}: ${vacancy[key]}`) // выводим консоль информацию в формате "key: value"
        }
        console.log() // добавляем пустую стоку после каждой вакансии
    }
}

const getVacanciesStats = (array) => { // функция вывода в консоль
    let vacancies = {total: 0} // объявляем объект: в котором будем хранить количество каждого наименования вакансий, а также total - общее число вакансий
    for (const vacancy of array) { // цикл по всем элементам массива
        vacancies[vacancy.name] = (vacancies[vacancy.name] + 1) || 1 // если в объекте уже есть такое наименование вакансии прибавляем к нему 1
        // в противном случае присваиваем значение 1
        vacancies.total++ // увеличиваем общее число
    }
    console.log(vacancies) // выводим результат в консоль
}

const getAverageSalary = (array) => { // функция подсчета средней зарплаты в рублях
    let divider = 0 // общее количество вакансий с зп в рублях
    let dividend = 0 // сумма зп в рублях
    for (const vacancy of array) { // цикл по всем элементам массива
        if (vacancy.salary_currency != 'RUR') { // если валюта зп не рубли,
            continue // переходим на следующую итерацию
        }
        if (!vacancy.salary_from && !vacancy.salary_to){ // если не указана ни нижнее, ни верхнее значение зп,
            continue // переходим на следующую итерацию
        } else if (vacancy.salary_from && vacancy.salary_to) { // если есть и верхняя и ни
            divider++ // увеличиваем общее количество вакансий с зп в рублях
            dividend+= (Number(vacancy.salary_from) + Number(vacancy.salary_to))/2 // добавляем к сумме среднее арифметическое
            // Number() используется для преобразования строки в число
        } else if (!vacancy.salary_from && vacancy.salary_to){ // если указана только верхняя граница зп
            divider++ // увеличиваем общее количество вакансий с зп в рублях
            dividend+= Number(vacancy.salary_to) // добавляем к сумме верхнюю границу
        } else if (vacancy.salary_from && !vacancy.salary_to){ // если указана только нижняя граница зп
            divider++ // увеличиваем общее количество вакансий с зп в рублях
            dividend+= Number(vacancy.salary_from) // добавляем к сумме нижнюю границу
        }
    }

    console.log(`Общее количество вакансий с зарплатой указанной в рублях - ${divider}`) // выводим результат в консоль
    console.log(`Средняя зарплата - ${dividend/divider}`)
}

const main = async (filePath) => { // нельзя нормально работать с асинхронными функциями в основном окне, поэтому объявляем вспомогательную фунцию
    const array = await formAdaptedArray(filePath) // получаем обработанный массив из первой функции
    return output(array) // вызываем нужную функцию (output, getAverageSalary или getVacanciesStats)
}

const filePath = path.resolve(__dirname, 'vacancies.csv') // получаем абсолютный путь до csv файла
main(filePath) // вызываем все вместе