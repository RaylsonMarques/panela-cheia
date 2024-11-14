import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
	public form: FormGroup;

	constructor(private readonly formBuilder: FormBuilder, private readonly router: Router) {}

	public ngOnInit(): void {
		this.init();
	}

	public submit(): void {
		const command = this.treatData();
		localStorage.setItem('newCommand', JSON.stringify(command));
		this.back();
	}

	public back(): void {
		this.router.navigate(['/']);
	}

	private init(): void {
		this.initializeVariables();
	}

	private initializeVariables(): void {
		this.form = this.formBuilder.group({
			commandNumber: [null, null], //- Numero da comanda
			type: [null, null], //- Tipo da comanda
			paymentMethod: [null, null], //- Método de pagamento
			amount: [null, null], //- Valor
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
}
