import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
	selector: "app-home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
	//- Tabelas
	public form: FormGroup;
	public referenceDateTitle: string;
	public showActionBar: boolean;
	//- Numero das comandas
	public commands: {
		marmita: {
			first: number;
			last: number;
			numbers: number[];
			lostCommands: number[];
			payment: { debit?: number[]; credit?: number[]; pix?: number[]; money?: number[]; benefit?: number[]; };
		};
		refeicao: {
			first: number;
			last: number;
			numbers: number[];
			lostCommands: number[];
			payment: { debit?: number[]; credit?: number[]; pix?: number[]; money?: number[]; benefit?: number[]; };
		};
	};

	//- Somatória de totais
	public sumValue: {
		marmita: { debit: number; credit: number; pix: number; money: number; benefit: number; };
		refeicao: { debit: number; credit: number; pix: number; money: number; benefit: number; };
		expenses: { debit: number; credit: number; pix: number; money: number; };
		generalTotal: number;
		marmitaTotal: number;
		refeicaoTotal: number;
		expensesTotal: number;
	};

	constructor(private readonly router: Router, private readonly formBuilder: FormBuilder) {}

	public ngOnInit(): void {
		this.init();
	}

	public redirect(route: string): void {
		this.router.navigate([route]);
	}

	public formatMoney(value: number): string {
		return Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
	}

	public resetResume(): void {
		localStorage.clear();
		this.initializeVariables();
	}

	public toggleActionBar(): void {
		this.showActionBar = !this.showActionBar;
	}

	private init(): void {
		this.initializeVariables();
		this.createForm();
		this.addListenerToDate();
		this.getAllCommands();
		this.getAllExpenses();
	}

	private initializeVariables(): void {
		this.referenceDateTitle = localStorage.getItem('referenceDate') || "";
		this.showActionBar = true;
		this.commands = {
			marmita: { first: 0, last: 0, numbers: [], lostCommands: [], payment: { debit: [], credit: [], pix: [], money: [], benefit: [] } },
			refeicao: { first: 0, last: 0, numbers: [], lostCommands: [], payment: { debit: [], credit: [], pix: [], money: [], benefit: [] } },
		};
		//- Somatória de totais
		this.sumValue = {
			marmita: { debit: 0, credit: 0, pix: 0, money: 0, benefit: 0 },
			refeicao: { debit: 0, credit: 0, pix: 0, money: 0, benefit: 0 },
			expenses: { debit: 0, credit: 0, pix: 0, money: 0 },
			generalTotal: 0,
			marmitaTotal: 0,
			refeicaoTotal: 0,
			expensesTotal: 0
		};
	}

	private createForm(): void {
		this.form = this.formBuilder.group({
			referenceDate: [null, null]
		});
	}

	private addListenerToDate(): void {
		this.form.get('referenceDate').valueChanges.subscribe((value: Date) => {
			const referenceDateValue: Date = new Date(value);
			const day: number = referenceDateValue.getDate();
			const month: number = referenceDateValue.getMonth() + 1;
			const year: number = referenceDateValue.getFullYear();

			this.referenceDateTitle = ` do dia ${day}/${month}/${year}`;
			localStorage.setItem('referenceDate', this.referenceDateTitle);
		});
	}

	private getAllCommands(): void {
		//- Busca as comandas e novas comandas salvas
		let allCommandsSaved = [];
		const commandsSaveInLocalStorage = JSON.parse(localStorage.getItem("allCommands"));
		const newCommands = JSON.parse(localStorage.getItem("newCommands"));
		localStorage.removeItem("newCommands");

		//- Verifica se há comandas salvas no armazenamento
		if (commandsSaveInLocalStorage)
			allCommandsSaved.push(...commandsSaveInLocalStorage);

		//- Adiciona a nova comanda no array de todas as comandas
		if (newCommands && newCommands.length > 0) allCommandsSaved.push(...newCommands);

		//- Salva todas as comandas
		localStorage.setItem("allCommands", JSON.stringify(allCommandsSaved));

		//- Itera no array de comandas salvas, e preenche o datasource das tabelas
		allCommandsSaved.forEach((command) => {
			//- Calcula os valores totais, e específicos de cada tipo
			this.calculateValueByPayment(command);
			//- Identifica os numeros das comandas
			this.commands[command.type].numbers.push(command.number);
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
	}

	private getAllExpenses(): void {
		let allExpensesSaved = [];
		const expensesSaveInLocalStorage = JSON.parse(localStorage.getItem("allExpenses"));
		const newExpenses = JSON.parse(localStorage.getItem("newExpenses"));
		localStorage.removeItem("newExpenses");

		//- Verifica se há comandas salvas no armazenamento
		if (expensesSaveInLocalStorage)
			allExpensesSaved.push(...expensesSaveInLocalStorage);

		//- Adiciona a nova comanda no array de todas as comandas
		if (newExpenses && newExpenses.length > 0) allExpensesSaved.push(...newExpenses);

		//- Salva todas as despesas
		localStorage.setItem("allExpenses", JSON.stringify(allExpensesSaved));

		//- Itera no array de comandas salvas, e preenche o datasource das tabelas
		allExpensesSaved.forEach((expense) => {
			//- Calcula os valores totais, e específicos de cada tipo
			this.calculateExpenseValueByPayment(expense);
		});
	}

	private calculateValueByPayment(command: any): any {
		const factory = {
			debito: (type: string, total: number, commandNumber: number): any => {
				if (type === "marmita") {
					//- Adiciona o número da comanda no controle de comandas
					this.commands.marmita.payment.debit.push(commandNumber);
					//- Calcula os valores totais
					this.sumValue.marmita.debit += total;
					this.sumValue.marmitaTotal += total;
				}

				if (type === "refeicao") {
					//- Adiciona o numero da comanda no controle de comandas
					this.commands.refeicao.payment.debit.push(commandNumber);
					//- Calcula os valores totais
					this.sumValue.refeicao.debit += total;
					this.sumValue.refeicaoTotal += total;
				}

				this.sumValue.generalTotal += total;
			},
			credito: (type: string, total: number, commandNumber: number): any => {
				if (type === "marmita") {
					this.commands.marmita.payment.credit.push(commandNumber);
					this.sumValue.marmita.credit += total;
					this.sumValue.marmitaTotal += total;
				}

				if (type === "refeicao") {
					this.commands.refeicao.payment.credit.push(commandNumber);
					this.sumValue.refeicao.credit += total;
					this.sumValue.refeicaoTotal += total;
				}

				this.sumValue.generalTotal += total;
			},
			pix: (type: string, total: number, commandNumber: number): any => {
				if (type === "marmita") {
					this.commands.marmita.payment.pix.push(commandNumber);
					this.sumValue.marmita.pix += total;
					this.sumValue.marmitaTotal += total;
				}

				if (type === "refeicao") {
					this.commands.refeicao.payment.pix.push(commandNumber);
					this.sumValue.refeicao.pix += total;
					this.sumValue.refeicaoTotal += total;
				}

				this.sumValue.generalTotal += total;
			},
			dinheiro: (type: string, total: number, commandNumber: number): any => {
				if (type === "marmita") {
					this.commands.marmita.payment.money.push(commandNumber);
					this.sumValue.marmita.money += total;
					this.sumValue.marmitaTotal += total;
				}

				if (type === "refeicao") {
					this.commands.refeicao.payment.money.push(commandNumber);
					this.sumValue.refeicao.money += total;
					this.sumValue.refeicaoTotal += total;
				}

				this.sumValue.generalTotal += total;
			},
			beneficio: (type: string, total: number, commandNumber: number): any => {
				if (type === "marmita") {
					this.commands.marmita.payment.benefit.push(commandNumber);
					this.sumValue.marmita.benefit += total;
					this.sumValue.marmitaTotal += total;
				}

				if (type === "refeicao") {
					this.commands.refeicao.payment.benefit.push(commandNumber);
					this.sumValue.refeicao.benefit += total;
					this.sumValue.refeicaoTotal += total;
				}

				this.sumValue.generalTotal += total;
			},
		};

		return factory[command.payment](command.type, command.totalCommand, command.number);
	}

	private calculateExpenseValueByPayment(expense: any): any {
		const factory = {
			debito: (total: number): any => {
				this.sumValue.expenses.debit += total;
				this.sumValue.expensesTotal += total;
			},
			credito: (total: number): any => {
				this.sumValue.expenses.debit += total;
				this.sumValue.expensesTotal += total;
			},
			pix: (total: number): any => {
				this.sumValue.expenses.debit += total;
				this.sumValue.expensesTotal += total;
			},
			dinheiro: (total: number): any => {
				this.sumValue.expenses.debit += total;
				this.sumValue.expensesTotal += total;
			},
			beneficio: (total: number): any => {
				this.sumValue.expenses.debit += total;
				this.sumValue.expensesTotal += total;
			},
		};

		return factory[expense.payment](expense.amount);
	}

	private generateRange(commandNumberInitial: number, commandNumberFinal: number): number[] {
		const arr = [];
    for (let i = commandNumberInitial; i <= commandNumberFinal; i++) arr.push(i);
    return arr;
	}
}
