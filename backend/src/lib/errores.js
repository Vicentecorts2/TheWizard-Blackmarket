// Error con código HTTP, para cortar una transacción con un mensaje claro
export class ErrorNegocio extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}