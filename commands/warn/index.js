const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const { CommandInteraction, UserContextMenuInteraction, GuildMember} = require('discord.js');
const Warn = require('./Warn');
const EmbedBuilder = require('./EmbedBuilder');
const ModalBuilder = require('./ModalBuilder');

module.exports = {

	active: true,
	category: 'Модерация',

	name: 'warn',
	title: title,
	description: description,
	slashOptions: slashOptions,

	init: async function(){
		return this;
	},

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int
	 */
	slash: async function(int){

		const subcommand = int.options.getSubcommand();

		if(subcommand === 'add'){
			if(!this.permission(int.member))
				return int.reply(EmbedBuilder.noPermissions(true));

			return int.showModal(ModalBuilder.newWarn(int, int.options.getUser('user').id))
		}

		const subcommandGroup = int.options.getSubcommandGroup();

		if(subcommandGroup === 'get'){

			if(subcommand === 'direct'){
				const warn = Warn.get(int.options.getInteger('id'));

				const msg = warn
					? await warn.getEmbed(int)
					: EmbedBuilder.noSuchWarn();

				return int.reply(msg);
			}

			if(subcommand === 'last'){
				const target = int.options.getUser('user', false);

				const warn = Warn.last(target?.id);

				const msg = warn
					? await warn.getEmbed(int)
					: (target ? EmbedBuilder.noWarns() : EmbedBuilder.noSuchWarn());

				return int.reply(msg);
			}

			if(subcommand === 'list'){
				const target = int.options.getUser('user');
				const ephemeral = int.options.getBoolean('ephemeral', false);

				let msg = await Warn.pagination(target).getEmbed(int);

				if(!msg) msg = EmbedBuilder.noWarns();
				msg.ephemeral = ephemeral

				return int.reply(msg);
			}
		}

		await int.reply({
			content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'),
			ephemeral: true
		});
	},

	/**
	 * Обработка контекстной команды на пользователе
	 * @param {UserContextMenuInteraction} int
	 */
	contextUser: async function(int){
		if(!this.permission(int.member))
			return int.reply(EmbedBuilder.noPermissions(true));

		return int.showModal(ModalBuilder.newWarn(int, int.targetUser.id))
	},

	/**
	 * Обработка нажатия на кнопку
	 * @param {ButtonInteraction} int
	 */
	button: async function(int){
		const data = int.customId.split('|');

		if(data[1] === 'embedEditReason'){
			if(!this.permission(int.member))
				return int.reply(EmbedBuilder.noPermissions(true));

			const warn = Warn.get(data[2]);
			return int.showModal(ModalBuilder.editWarn(int, warn));
		}

		if(data[1] === 'embedPage'){
			let page = data[3];
			const target = client.users.cache.get(data[2]);

			const msg = await Warn.pagination(target, page).getEmbed(int);

			return int.update(msg);
		}

		if(data[1] === 'embedRemoveWarn'){
			if(!this.permission(int.member))
				return int.reply(EmbedBuilder.noPermissions(true));

			const warn = Warn.get(data[2]);
			warn.flags = { removed: true };
			warn.save();

			await int.update(await warn.getEmbed(int));

			return int.followUp(await EmbedBuilder.removeWarn(int, warn, true));
		}

		if(data[1] === 'embedAddWarn'){
			if(!this.permission(int.member))
				return int.reply(EmbedBuilder.noPermissions(true));

			const warn = Warn.get(data[2]);
			warn.flags = { removed: false };
			warn.save();

			await int.update(await warn.getEmbed(int));

			return int.followUp(await EmbedBuilder.removeWarn(int, warn, true));
		}

		await int.reply({
			content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'),
			ephemeral: true
		});
	},

	/**
	 * Обработка модалки
	 * @param {ModalSubmitInteraction} int
	 */
	modal: async function(int){
		const data = int.customId.split('|');
		const reason = int.fields.getField('reason').value;

		if(data[1] === 'NewWarnModal'){
			const warn = new Warn({
				target: data[2],
				reason: reason,
				author: int.user.id
			});
			warn.save();

			return int.reply(await EmbedBuilder.newWarn(int, warn));
		}

		if(data[1] === 'EditWarnModal'){

			const warn = Warn.get(data[2]);
			warn.reason = reason;
			warn.save();

			await int.update(await warn.getEmbed(int));

			return int.followUp(await EmbedBuilder.editWarn(int, warn, true));
		}

		await int.reply({
			content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'),
			ephemeral: true
		});
	},

	/**
	 * Проверка наличия роли Оратор или права управления ролями
	 *
	 * @param {GuildMember} member
	 */
	permission: member =>
		member.roles.cache.has('916999822693789718') ||
		member.roles.cache.has('613412133715312641') ||
		member.id === '500020124515041283'


};