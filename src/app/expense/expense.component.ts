import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../shared/service/notification.service';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss']
})
export class ExpenseComponent implements OnInit {
	public form: FormGroup;
	private newExpenses: any[];

	constructor(
		private readonly notificationService: NotificationService,
		private readonly formBuilder: FormBuilder,
		private readonly router: Router
	) {}

	public ngOnInit(): void {
		this.init();
	}

	public submit(): void {
		if (this.formIsValid()) {
			this.newExpenses = [...this.newExpenses, this.treatData()];
			localStorage.setItem('newExpenses', JSON.stringify(this.newExpenses));
			this.notificationService.success("Despesa(s), salvas com sucesso!");
			this.back();
		} else {
			this.notificationService.error("Formulário inválido");
		}
	}

	public saveAndContinue(): void {
		if (this.formIsValid()) {
			this.newExpenses.push(this.treatData());
			localStorage.setItem('newExpenses', JSON.stringify(this.newExpenses));
			this.notificationService.success("Despesa adicionada com sucesso!");
			this.clearForm();
		} else {
			this.notificationService.error("Formulário inválido");
		}
	}

	public back(): void {
		this.router.navigate(['/']);
	}

	private init(): void {
		this.initializeVariables();
	}

	private initializeVariables(): void {
		this.newExpenses = [];
		this.form = this.formBuilder.group({
			amount: [null, Validators.required], //- Valor
			paymentMethod: [null, Validators.required], //- Método de pagamento
			description: [null, Validators.required] //- Descrição da despesa
		});
	}

	private treatData(): any {
		const { amount, paymentMethod, description } = this.form.controls;

		const expense: any = {
			amount: amount.value,
			payment: paymentMethod.value,
			description: description.value
		}

		return expense;
	}

	private formIsValid(): boolean {
		if (this.form.get('paymentMethod').invalid) {
			return false;
		}
		if (this.form.get('amount').invalid) {
			return false;
		}
		if (this.form.get('description').invalid) {
			return false;
		}

		return true;
	}

	private clearForm(): void {
		this.form.controls['paymentMethod'].setValue("");
		this.form.controls['amount'].setValue("");
		this.form.controls['description'].setValue(1);
	}
}
