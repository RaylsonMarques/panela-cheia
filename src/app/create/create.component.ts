import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../shared/service/notification.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
	public form: FormGroup;
	private newCommands: any[];

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly notificationService: NotificationService,
		private readonly router: Router) {}

	public ngOnInit(): void {
		this.init();
	}

	public submit(): void {
		if (this.formIsValid()) {
			this.newCommands = [...this.newCommands, this.treatData()];
			localStorage.setItem('newCommands', JSON.stringify(this.newCommands));
			this.notificationService.success("Comanda(s), salvas com sucesso!");
			this.back();
		} else {
			this.notificationService.error("Formulário inválido");
		}
	}

	public createAndContinue(): void {
		if (this.formIsValid()) {
			this.newCommands.push(this.treatData());
			localStorage.setItem('newCommands', JSON.stringify(this.newCommands));
			this.notificationService.success("Comanda adicionada com sucesso!");
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
		this.newCommands = [];

		this.form = this.formBuilder.group({
			commandNumber: [null, Validators.required], //- Numero da comanda
			type: [null, Validators.required], //- Tipo da comanda
			paymentMethod: [null, Validators.required], //- Método de pagamento
			amount: [null, Validators.required], //- Valor
			quantity: [1, null] //- Quantidade de refeições
		});
	}

	private treatData(): any {
		const { commandNumber, type, paymentMethod, amount, quantity } = this.form.controls;

		const command = {
			type: type.value,
			number: commandNumber.value,
			payment: paymentMethod.value,
			amount: amount.value,
			quantity: quantity.value,
			totalCommand: amount.value * quantity.value
		}

		return command;
	}

	private formIsValid(): boolean {
		if (this.form.get('commandNumber').invalid) {
			this.form.get('commandNumber').markAsTouched();
			return false;
		}
		if (this.form.get('type').invalid) {
			this.form.get('type').markAsTouched();
			return false;
		}
		if (this.form.get('paymentMethod').invalid) {
			this.form.get('paymentMethod').markAsTouched();
			return false;
		}
		if (this.form.get('amount').invalid) {
			this.form.get('amount').markAsTouched();
			return false;
		}
		if (this.form.get('quantity').invalid) {
			this.form.get('quantity').markAsTouched();
			return false;
		}

		return true;
	}

	private clearForm(): void {
		this.form.controls['commandNumber'].setValue("");
		this.form.controls['type'].setValue("");
		this.form.controls['paymentMethod'].setValue("");
		this.form.controls['amount'].setValue("");
		this.form.controls['quantity'].setValue(1);
	}
}
