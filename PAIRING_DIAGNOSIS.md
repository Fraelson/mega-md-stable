# Diagnóstico do pairing alfanumérico

Fontes externas consultadas:
- https://baileys.wiki/authentication/pairing-code
- https://whiskeysockets-baileys-94.mintlify.app/concepts/connection
- https://github.com/WhiskeySockets/Baileys/issues/2512

A documentação oficial indica que `requestPairingCode()` deve ser chamado quando o evento `connection.update` entregar `qr`, e não imediatamente após criar o socket, porque o socket pode ainda não estar pronto. O número deve conter apenas dígitos e o código tem 8 caracteres. A opção `printQRInTerminal` está deprecated e deve ser removida quando o fluxo pretendido é pairing por código.

A documentação classifica 401 como `loggedOut`, mas o issue #2512 e os comentários documentam que o pairing bem-sucedido pode provocar um encerramento transitório 515 que exige reiniciar imediatamente usando as credenciais recém-gravadas. A gravação de `creds.update` precisa concluir antes do handler de `connection.update` reler a sessão; o reconnect após 515 não deve ser bloqueado nem atrasado excessivamente. O 401 persistente após a geração do código no caso actual sugere que a implementação pede o código cedo demais e mistura fallback QR/reconnect, ou que a sessão/credenciais não são persistidas antes do encerramento.

No `silva.js` actual, o código chama `requestPairingCode` 2 segundos depois de `makeWASocket`, antes de qualquer evento `qr`; define `printQRInTerminal: true`; imprime QR no evento `qr`; e trata 401 apagando a sessão e reconectando, enquanto os logs mostram sucessivos códigos seguidos de logout. A correcção deve mover o pedido para o handler `connection.update` quando `qr` ocorrer, remover `printQRInTerminal`, impedir a emissão/uso de QR no fluxo, preservar e aguardar `saveCreds`, e tratar 515 como reconnect imediato. Também deve evitar múltiplos pedidos de código no mesmo socket.
