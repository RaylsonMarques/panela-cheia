import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { CreateComponent } from "./create/create.component";
import { HomeComponent } from "./home/home.component";
import { ExpenseComponent } from "./expense/expense.component";

const routes: Routes = [
	{ path: "", component: HomeComponent },
	{ path: "create", component: CreateComponent },
	{ path: "expense", component: ExpenseComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
