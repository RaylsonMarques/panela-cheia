import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class NotificationService {
	constructor(private readonly toastService: ToastrService) {}

	public success(message: string) {
		this.toastService.success(message, "Sucesso");
	}

	public error(message: string) {
		this.toastService.error(message, "Ops, ocorreu um erro...");
	}

	public info(message: string) {
		this.toastService.info(message, "Importante!");
	}

	public alert(message: string) {
		this.toastService.warning(message, "Atenção!");
	}

	public limpar() {
		this.toastService.clear();
	}
}
