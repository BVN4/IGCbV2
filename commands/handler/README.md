#### About

##### handler
Обработчик сообщений пользователей.
Модуль является сборником функций, которые как либо реагируют на сообщения пользователей в разных каналах.
Так же при инициализации бота, модули, в которых есть обработчик команд, добавляются в массив, который позже используется для их вызова.

#### Functions:
Функции хранятся в директории `./functions/` в виде файлов и инициализируются `./initFunctions.js`.
Файлы функций должны возвращать объект, подобный объекту модуля:
```js
module.exports = {

	/**
	 * Содержит значение активности функции.
	 * Вне зависимости от значения, будет подключен и инициализирован.
	 */
	active: (Boolean), // required

	/**
	 * Короткое обозначение функции. Содержит объект локализации.
	 * Обязательная локализация - русская.
	 * Для обозначений языков используется формат ISO 639-1
	 */
	title: (Object) { // required
		[Language code ISO 639-1]: (String),
	},

	/**
	 * Условия вызова функции.
	 * Если true - то функция будет вызываться всегда, при любых сообщениях.
	 * Такие же условия вызова имеют, например обработчики в других модулях, а детальные проверки уже внутри самого модуля.
	 */
	allChannels: (Boolean), // required

	/**
	 * Продвинутые условия вызова. Не активны, если "allChannels" имеет значение true.
	 * Содержит объект, где ключ - ID канала или категории, а значение показывает, распространяется ли функция на треды. Желательно в комментарии указать название канала.
	 *
	 * Функция будет вызываться при отправке сообщения в указанном канале или категории.
	 * Если сообщение отправлено в треде, то будет дополнительно проверятся, разрешён ли вызов функции в треде.
	 */
	allowedChannels: (Object) { // required
		[Snowflake ID channel]: (Boolean),
	},

	/**
	 * Функция инициализации. Используется при инициализации модуля.
	 * Всегда должен возвращать объект модуля (this).
	 * @return {Object} this
	 */
	init: async function(){
		return this;
	},

	/**
	 * Индексная функция.
	 * @param {Message} msg Сообщение пользователя
	 */
	call: async function(msg){
		...
	}

}
```

#### Dependencies
- `global.client`
- `global.commands`
- `/function/log.js`
- `/function/reaction.js`
- `/function/errorHandler.js`
- `/function/member2name.js`
- `/function/formatDate.js`