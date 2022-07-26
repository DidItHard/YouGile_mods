var column = Items.get('f33c8e9a-5e27-4139-b60c-cb93a0415f9e'); // Колонка с данными
var project = Items.get('0bc8cd0e-30ab-4a4c-b15c-e649e6990033');

// Стартовая строка, чтобы дать изначальные значения
project.setData({
  cost_data: 0, 
  benefit_data: 0, 
  benefit_sticker_values: [],
  cost_sticker_values: [],
})


/* Всплывающее окно */
var global_panel = UI.panel();
global_panel.style = {
    position: 'fixed',
    widthg: '500px',
    height: '220px',
    top: '25%',
    right: '25%',
    transform: 'translate(-50%, -50%)',
    background: '#fff',
    textAlign: 'center',
    padding: '50px',
    zIndex: 1000,
    borderRadius: '10px',
    boxShadow: '0 3px 11px 0 rgba(0, 0, 0, 3)'
};
column.ui.add(global_panel);    // Закрепляем к колонке основное окно
//project.ui.add(global_panel);    // Закрепляем к колонке основное окно



// Строка ориетировачной прибыли
var panel2 = UI.panel();
global_panel.add(panel2)
panel2.add(UI.text('Общая прибыль: ')) // Выписали заголовок2

// Переменная общей прибыли
var overall_benefits = UI.text(project.getData().benefit_data);
panel2.add(overall_benefits)


// Строка общих затрат
var panel = UI.panel(); 
global_panel.add(panel);

// Переменная общих затрат
var overall_cost = UI.text(project.getData().cost_data);   // Переменная общих трат
panel.add(UI.text('Общие затраты: ')) // Выписали заголовок
panel.add(overall_cost);  // Выписали в интерфейс число


// Строка чистой прибыли
var panel3 = UI.panel();
global_panel.add(panel3);
panel3.add(UI.text(' Чистая прибыль: '))

// Переменная чистой прибыли
var bacon = UI.text('0');
panel3.add(bacon);
bacon.text = Number(project.getData().benefit_data) - Number(project.getData().cost_data);


// Определяем стили наших блоков
panel.style = { // Стиль панельки
  margin: '10px',
};
panel2.style = { // Стиль панельки
  margin: '10px',
};
panel3.style = { // Стиль панельки
  margin: '10px',
};

/********** *************/

/* Определили нужные для работы стикеры */
var benefit_sticker = Stickers.get('Доход'); // Мой стикер "Доход"
var nail_sticker = Stickers.get('Назначить цену'); // Мой стикер "Назначить цену"
var cost_sticker = Stickers.get('Расход'); // Мой стикер "Расход"


// Проект
var project = Items.get('0bc8cd0e-30ab-4a4c-b15c-e649e6990033');

// Стартовая строка, чтобы дать изначальные значения
project.setData({cost_data: 0, benefit_data: 0})

/* Если поставили нужный стикер */
Stickers.onPin = function (task, sticker) {
    if (sticker.id === nail_sticker.id) {
        var input = prompt('Введите стоимость задачи');
  
        //Если записываем прибыль
        if (input.indexOf('+') === -1){
            cost_sticker.addState(String(input));
            cost_sticker.setData(String(input), {color: '#F99'});
            Stickers.pin(task, cost_sticker, String(input));

            // Переписали данные в колонке
            var data = project.getData();
            data.cost_data = Number(input) + Number(data.cost_data);
            project.setData(data); 

            // Переписали строчку в интерфейсе
            overall_cost.text = project.getData().cost_data; 

            // Добавляем значение стикера в базу
            var data = project.getData();
            data.cost_sticker_values.push(input);
            project.setData(data);
        }
        //  Если траты
        else {
            var name_sticker = String(input).slice(1).trim();
            benefit_sticker.addState(name_sticker);
            benefit_sticker.setData(name_sticker, {color: '#6C6'});
            Stickers.pin(task, benefit_sticker, name_sticker);

            // Переписали данные в колонке
            var data = project.getData();
            data.benefit_data = Number(input) + Number(data.benefit_data);
            project.setData(data); 

            // Переписали строчку в интерфейсе
            overall_benefits.text = project.getData().benefit_data;

            // Добавляем значение стикера в базу
            var data = project.getData();
            data.benefit_sticker_values.push(input);
            project.setData(data);
        }

        // Записали данные в задачу
        //task.setData({cost: input});
        
        // Корректируем чистую прибыль
        bacon.text = Number(project.getData().benefit_data) - Number(project.getData().cost_data);
    }
    return true
  };

/* Если убрали стикер (пока только Расход)*/
Stickers.onUnpin = function (task, sticker) {
  // Если стикер "Расход"
  if (sticker.id === cost_sticker.id) {
    // Стоимость задачи
    var price_cost = Stickers.getValue(task, cost_sticker);

    // Переписываем данные
    var data = project.getData();
    data.cost_data = Number(data.cost_data) - Number(price_cost);
    project.setData(data); 

    // Переписали строчку в интерфейсе
    overall_cost.text = project.getData().cost_data; 

    // Удаляем знаечение стикера (из базы и по факту, если в базе только одно)
    var data = project.getData();
    var arr = data.cost_sticker_values;
    if (arr.indexOf(price_cost) == arr.lastIndexOf(price_cost)) {
      cost_sticker.removeState(price_cost); // Удалили само значение стикера, т.к. оно одно
    }
    data.cost_sticker_values.splice(arr.indexOf(price_cost), 1);// Удалили из базы наше значение стикера

  };

  // Если стикер "Доход"
  if (sticker.id === benefit_sticker.id) {
    // Стоимость задачи
    //var price_cost = task.getData().cost;
    var price_cost = Stickers.getValue(task, benefit_sticker);

    // Переписываем данные
    var data = project.getData();
    data.benefit_data = Number(data.benefit_data) - Number(price_cost);
    project.setData(data); 

    // Переписали строчку в интерфейсе
    overall_benefits.text = project.getData().benefit_data; 

    // Удаляем стикер (подстикер)
    benefit_sticker.removeState(price_cost);

    // Удаляем знаечение стикера (из базы и по факту, если в базе только одно)
    var data = project.getData();
    var arr = data.benefit_sticker_values;
    if (arr.indexOf(price_cost) == arr.lastIndexOf(price_cost)) {
      benefit_sticker.removeState(price_cost); // Удалили само значение стикера, т.к. оно одно
    }
    data.benefit_sticker_values.splice(arr.indexOf(price_cost), 1);// Удалили из базы наше значение стикера

  };

  // Корректируем чистую прибыль
  bacon.text = Number(project.getData().benefit_data) - Number(project.getData().cost_data);

  return true;
};

/* Функция, если удалили задачу со стикером (Расход или Доход) */
Items.onDelete = function (task) {
  // Если удаляется задача
  if (task.type === 'Task' && Stickers.isPinned(task, cost_sticker)){
      // Стоимость задачи
    var price = Stickers.getValue(task, cost_sticker);

    // Переписываем данные
    var data = project.getData();
    data.cost_data = Number(data.cost_data) - Number(price);
    project.setData(data); 

    // Переписали строчку в интерфейсе
    overall_cost.text = project.getData().cost_data; 

    // Удаляем стикер (подстикер)
    cost_sticker.removeState(price);

    // Удаляем знаечение стикера (из базы и по факту, если в базе только одно)
    var data = project.getData();
    var arr = data.cost_sticker_values;
    if (arr.indexOf(price) == arr.lastIndexOf(price)) {
      cost_sticker.removeState(price); // Удалили само значение стикера, т.к. оно одно
    }
    data.cost_sticker_values.splice(arr.indexOf(price), 1);// Удалили из базы наше значение стикера
  };

  if (task.type === 'Task' && Stickers.isPinned(task, benefit_sticker)){
      // Стоимость задачи
    var price = Stickers.getValue(task, benefit_sticker);

    // Переписываем данные
    var data = project.getData();
    data.benefit_data = Number(data.benefit_data) - Number(price);
    project.setData(data); 

    // Переписали строчку в интерфейсе
    overall_benefits.text = project.getData().benefit_data; 

    // Удаляем знаечение стикера (из базы и по факту, если в базе только одно)
    var data = project.getData();
    var arr = data.benefit_sticker_values;
    if (arr.indexOf(price) == arr.lastIndexOf(price)) {
      benefit_sticker.removeState(price); // Удалили само значение стикера, т.к. оно одно
    }
    data.benefit_sticker_values.splice(arr.indexOf(price), 1);// Удалили из базы наше значение стикера
  };

  // Корректируем чистую прибыль
  bacon.text = Number(project.getData().benefit_data) - Number(project.getData().cost_data);

  return true;
};


