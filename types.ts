export interface Product{id:string;name:string;type?:'product'|'service'|'digital';author?:string;category?:string;quantity:number;price:number;salePrice?:number;costPrice?:number;allocated?:number;isbn?:string;publisher?:string;barcode?:string;rackNumber?:string}
export interface InvoiceItem{productId:string;productName:string;quantity:number;price:number;costPrice?:number;discount?:number}
export interface PurchaseItem{productId:string;productName:string;quantity:number;costPrice:number;price?:number;category?:string}
export interface Customer{id:string;name:string;phone:string;address?:string;email?:string;notes?:string;balance?:number}
export