import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
	selector: "app-home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
	//- Tabelas
	public displayedColumns: string[];
	public dataSource: {
		debit?: any[];
		credit?: any[];
		pix?: any[];
		money?: any[];
		benefit?: any[];
	};
	//- Numero das comandas
	public commands: {
		marmita: {
			first: number;
			last: number;
			numbers: number[];
			lostCommands: number[];
			payment: {
				debit?: number[];
				credit?: number[];
				pix?: number[];
				money?: number[];
				benefit?: number[];
			};
		};
		refeicao: {
			first: number;
			last: number;
			numbers: number[];
			lostCommands: number[];
			payment: {
				debit?: number[];
				credit?: number[];
				pix?: number[];
				money?: number[];
				benefit?: number[];
			};
		};
	};
	//- Somatória de totais
	public sumValue: {
		marmita: {
			debit: number;
			credit: number;
			pix: number;
			money: number;
			benefit: number;
		};
		refeicao: {
			debit: number;
			credit: number;
			pix: number;
			money: number;
			benefit: number;
		};
		generalTotal: number;
		marmitaTotal: number;
		refeicaoTotal: number;
	};

	constructor(private readonly router: Router) {}

	public ngOnInit(): void {
		this.init();
	}

	public redirect(): void {
		this.router.navigate(["/create"]);
	}

	public formatMoney(value: number): string {
		return Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	}

	private init(): void {
		this.initializeVariables();
		this.getAllCommands();
	}

	private initializeVariables(): void {
		this.displayedColumns = [
			"no_command",
			"type",
			"date",
			"value",
			"quantity",
			"total",
		];
		this.dataSource = {};
		this.commands = {
			marmita: {
				first: 0,
				last: 0,
				numbers: [],
				lostCommands: [],
				payment: {
					debit: [],
					credit: [],
					pix: [],
					money: [],
					benefit: [],
				},
			},
			refeicao: {
				first: 0,
				last: 0,
				numbers: [],
				lostCommands: [],
				payment: {
					debit: [],
					credit: [],
					pix: [],
					money: [],
					benefit: [],
				},
			},
		};
		//- Somatória de totais
		this.sumValue = {
			marmita: { debit: 0, credit: 0, pix: 0, money: 0, benefit: 0 },
			refeicao: { debit: 0, credit: 0, pix: 0, money: 0, benefit: 0 },
			generalTotal: 0,
			marmitaTotal: 0,
			refeicaoTotal: 0,
		};
	}

	private getAllCommands(): void {
		//- Reinicia os dados da tabela
		this.dataSource = {
			debit: [],
			credit: [],
			pix: [],
			money: [],
			benefit: [],
		};

		//- Busca as comandas e novas comandas salvas
		let allCommandsSaved = [];
		const commandsSaveInLocalStorage = JSON.parse(
			localStorage.getItem("allCommands")
		);
		const newCommand = JSON.parse(localStorage.getItem("newCommand"));
		localStorage.removeItem("newCommand");

		//- Verifica se há comandas salvas no armazenamento
		if (commandsSaveInLocalStorage)
			allCommandsSaved.push(...commandsSaveInLocalStorage);

		//- Adiciona a nova comanda no array de todas as comandas
		if (newCommand) allCommandsSaved.push(newCommand);

		//- Salva todas as comandas
		localStorage.setItem("allCommands", JSON.stringify(allCommandsSaved));

		//- Itera no array de comandas salvas, e preenche o datasource das tabelas
		allCommandsSaved.forEach((command) => {
			this.fillDataSourceByPayment(command);
			//- Calcula os valores totais, e específicos de cada tipo
			this.calculateValueByPayment(command);
			//- Identifica os numeros das comandas
			if (command.type === 'refeicao') {
				this.commands.refeicao.numbers.push(command.number);
			}
			if (command.type === 'marmita') {
				this.commands.marmita.numbers.push(command.number);
			}
		});

		//- Busca o menor número do array
		this.commands.refeicao.first = Math.min(...this.commands.refeicao.numbers);
		this.commands.marmita.first = Math.min(...this.commands.marmita.numbers);
		//- Busca o maior número do array
		this.commands.refeicao.last = Math.max(...this.commands.refeicao.numbers);
		this.commands.marmita.last = Math.max(...this.commands.marmita.numbers);
		//- Cria e verifica quais os numeros faltantes no range encontrado
		const commandsRangeRefeicao: number[] = this.generateRange(this.commands.refeicao.first, this.commands.refeicao.last);
		const commandsFoundedRefeicao: number[] = this.commands.refeicao.numbers.filter((commandNumber: number) => !commandsRangeRefeicao.includes(commandNumber));
		commandsFoundedRefeicao.forEach((commandNumber: number) => {
			const index: number = commandsRangeRefeicao.findIndex((item) => item == commandNumber);
			commandsRangeRefeicao.splice(index, 1);
		});
		this.commands.refeicao.lostCommands = commandsRangeRefeicao;

		const commandsRangeMarmita: number[] = this.generateRange(this.commands.marmita.first, this.commands.marmita.last);
		const commandsFoundedMarmita: number[] = this.commands.marmita.numbers.filter((commandNumber: number) => !commandsRangeMarmita.includes(commandNumber));
		commandsFoundedMarmita.forEach((commandNumber: number) => {
			const index: number = commandsRangeMarmita.findIndex((item) => item == commandNumber);
			commandsRangeMarmita.splice(index, 1);
		});
		this.commands.marmita.lostCommands = commandsRangeMarmita;

		//- Verifica o primeiro número da comanda
		//- Verifica o último número da comanda
		//- Cria um array com o range de comandas criadas. ex.: 1201 - 1359
		//- Cria um array com os numeros de comandas cadastrados
		//- Identifica os números faltantes no array
	}

	private fillDataSourceByPayment(command: any): any {
		//- Formatação da data
		const date: Date = new Date();
		const day: number = date.getDate();
		const month: number = date.getMonth() + 1;
		const year: number = date.getFullYear();

		const factory = {
			debito: (commandNumber: number, type: string, amount: number, quantity: number, total: number): any => {
				this.dataSource.debit.push({
					no_command: commandNumber,
					type,
					date: `${day}/${month}/${year}`,
					value: amount,
					quantity,
					total,
				});

				if (type === "marmita") this.commands.marmita.payment.debit.push(commandNumber);
				if (type === "refeicao") this.commands.refeicao.payment.debit.push(commandNumber);
			},
			credito: (commandNumber: number, type: string, amount: number, quantity: number, total: number): any => {
				this.dataSource.credit.push({
					no_command: commandNumber,
					type,
					date: `${day}/${month}/${year}`,
					value: amount,
					quantity,
					total,
				});

				if (type === "marmita") this.commands.marmita.payment.credit.push(commandNumber);
				if (type === "refeicao") this.commands.refeicao.payment.credit.push(commandNumber);
			},
			pix: (commandNumber: number, type: string, amount: number, quantity: number, total: number): any => {
				this.dataSource.pix.push({
					no_command: commandNumber,
					type,
					date: `${day}/${month}/${year}`,
					value: amount,
					quantity,
					total,
				});

				if (type === "marmita") this.commands.marmita.payment.pix.push(commandNumber);
				if (type === "refeicao") this.commands.refeicao.payment.pix.push(commandNumber);
			},
			dinheiro: (commandNumber: number, type: string, amount: number, quantity: number, total: number): any => {
				this.dataSource.money.push({
					no_command: commandNumber,
					type,
					date: `${day}/${month}/${year}`,
					value: amount,
					quantity,
					total,
				});

				if (type === "marmita") this.commands.marmita.payment.money.push(commandNumber);
				if (type === "refeicao") this.commands.refeicao.payment.money.push(commandNumber);
			},
			beneficio: (commandNumber: number, type: string, amount: number, quantity: number, total: number): any => {
				this.dataSource.benefit.push({
					no_command: commandNumber,
					type,
					date: `${day}/${month}/${year}`,
					value: amount,
					quantity,
					total,
				});

				if (type === "marmita") this.commands.marmita.payment.benefit.push(commandNumber);
				if (type === "refeicao") this.commands.refeicao.payment.benefit.push(commandNumber);
			},
		};

		return factory[command.payment](
			command.number,
			command.type,
			command.amount,
			command.quantity,
			command.totalCommand
		);
	}

	private calculateValueByPayment(command: any): any {
		const factory = {
			debito: (type: string, total: number): any => {
				if (type === "marmita") {
					this.sumValue.marmita.debit += total;
					this.sumValue.marmitaTotal += total;
					this.sumValue.generalTotal += total;
				}
				if (type === "refeicao") {
					this.sumValue.refeicao.debit += total;
					this.sumValue.refeicaoTotal += total;
					this.sumValue.generalTotal += total;
				}
			},
			credito: (type: string, total: number): any => {
				if (type === "marmita") {
					this.sumValue.marmita.credit += total;
					this.sumValue.marmitaTotal += total;
					this.sumValue.generalTotal += total;
				}
				if (type === "refeicao") {
					this.sumValue.refeicao.credit += total;
					this.sumValue.refeicaoTotal += total;
					this.sumValue.generalTotal += total;
				}
			},
			pix: (type: string, total: number): any => {
				if (type === "marmita") {
					this.sumValue.marmita.pix += total;
					this.sumValue.marmitaTotal += total;
					this.sumValue.generalTotal += total;
				}
				if (type === "refeicao") {
					this.sumValue.refeicao.pix += total;
					this.sumValue.refeicaoTotal += total;
					this.sumValue.generalTotal += total;
				}
			},
			dinheiro: (type: string, total: number): any => {
				if (type === "marmita") {
					this.sumValue.marmita.money += total;
					this.sumValue.marmitaTotal += total;
					this.sumValue.generalTotal += total;
				}
				if (type === "refeicao") {
					this.sumValue.refeicao.money += total;
					this.sumValue.refeicaoTotal += total;
					this.sumValue.generalTotal += total;
				}
			},
			beneficio: (type: string, total: number): any => {
				if (type === "marmita") {
					this.sumValue.marmita.benefit += total;
					this.sumValue.marmitaTotal += total;
					this.sumValue.generalTotal += total;
				}
				if (type === "refeicao") {
					this.sumValue.refeicao.benefit += total;
					this.sumValue.refeicaoTotal += total;
					this.sumValue.generalTotal += total;
				}
			},
		};

		return factory[command.payment](command.type, command.totalCommand);
	}

	private generateRange(commandNumberInitial: number, commandNumberFinal: number): number[] {
		const arr = [];
    for (let i = commandNumberInitial; i <= commandNumberFinal; i++) arr.push(i);
    return arr;
	}
}
