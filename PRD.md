# PRD - WorkLedger

## 1. Objetivo

Criar um sistema simples, completo e local para registrar serviços por hora, calcular automaticamente valores a receber, registrar baixas de pagamento e carregar diferenças não pagas para o próximo serviço.

O valor padrão da hora trabalhada será de R$ 150,00, mas o sistema deve permitir edição desse valor globalmente e também por serviço.

O nome do produto será WorkLedger. A interface deve suportar português e inglês. A moeda padrão será BRL, mas serviços específicos podem ser registrados em USD.

Cada usuário deve ter seus próprios dados. O login será persistido no navegador via localStorage, e o backend deve filtrar clientes, serviços e configurações pelo usuário autenticado.

## 2. Público-alvo

Profissionais autônomos, consultores, prestadores de serviço e pequenas operações que precisam controlar horas trabalhadas, valores em aberto e pagamentos recebidos sem depender de planilhas.

## 3. Problema

Hoje o controle manual de horas e pagamentos costuma gerar falhas como:

- Esquecimento de horas adicionais em um serviço já iniciado.
- Dificuldade para saber o saldo em aberto.
- Baixas parciais sem histórico claro.
- Diferenças não pagas que precisam ser lembradas no próximo serviço.
- Falta de visão consolidada de valores faturados, pagos e pendentes.

## 4. Escopo da primeira versão

### Funcionalidades incluídas

- Criar serviços.
- Entrar com e-mail e senha.
- Criar conta de usuário.
- Recuperar senha definindo uma nova senha local.
- Persistir o usuário logado no localStorage.
- Isolar dados por usuário.
- Editar serviços.
- Excluir serviços com confirmação.
- Alternar idioma da interface entre português e inglês.
- Definir moeda do serviço entre BRL e USD.
- Gerenciar uma lista de clientes.
- Adicionar, editar e remover clientes.
- Relacionar um cliente cadastrado a um serviço.
- Informar data e hora do serviço.
- Definir cliente, título e observações do serviço.
- Usar data e hora como nome padrão quando o título não for preenchido.
- Usar automaticamente a hora padrão de R$ 150,00.
- Usar BRL como moeda padrão.
- Permitir serviço em USD.
- Editar o valor da hora padrão.
- Editar o valor da hora de um serviço específico.
- Acrescentar desconto ou acréscimo em um serviço.
- Adicionar múltiplos períodos de trabalho no mesmo serviço.
- Informar data, início e fim de cada período.
- Remover períodos de trabalho.
- Calcular horas e valor automaticamente.
- Exibir valor total do serviço.
- Exibir pagamentos já registrados.
- Exibir saldo em aberto.
- Registrar baixa total.
- Registrar baixa parcial.
- Na baixa parcial, permitir:
  - manter o restante em aberto no mesmo serviço;
  - transferir o restante para o próximo serviço criado.
- Aplicar automaticamente saldo transferido ao próximo serviço.
- Listar serviços em aberto, pagos e com saldo transferido.
- Exibir resumo financeiro geral.
- Persistir dados em SQLite local.

### Fora do escopo inicial

- Envio real de e-mail para recuperação de senha.
- Autenticação com provedor externo.
- Emissão de nota fiscal.
- Integração com bancos ou Pix.
- Exportação PDF.
- Controle de impostos.
- Aplicativo mobile nativo.

## 5. Regras de negócio

### Cálculo de horas

- Cada lançamento deve ter horário inicial e final.
- O sistema calcula a duração em minutos.
- Se o horário final for menor ou igual ao inicial, o lançamento é inválido.
- O valor do lançamento é:

```text
minutos / 60 * valor_hora_do_servico
```

### Serviço

- Um serviço pode ter vários lançamentos de horas.
- Um serviço pode ser relacionado a um cliente cadastrado.
- Um serviço deve ter moeda própria.
- Pagamentos e saldo de um serviço usam a moeda definida no serviço.
- Totais financeiros devem ser exibidos separados por moeda quando houver mais de uma moeda.
- Um serviço deve ter data e hora de referência.
- Se o usuário não informar um título, o sistema deve gerar automaticamente um nome baseado na data e hora.
- O valor do serviço é a soma dos lançamentos mais eventual saldo transferido de serviço anterior.
- O ajuste financeiro pode ser desconto ou acréscimo.
- O desconto reduz o valor total do serviço.
- O acréscimo aumenta o valor total do serviço.
- O total do serviço não pode ficar negativo após desconto.
- O valor da hora é salvo no serviço para preservar histórico, mesmo que o valor padrão mude depois.
- A exclusão de serviço deve exigir confirmação e remover horas e pagamentos vinculados.

### Pagamento

- Um serviço pode ter vários pagamentos.
- O saldo em aberto é:

```text
max(total_bruto - desconto, 0) - pagamentos
```

### Baixa total

- Registra pagamento igual ao saldo em aberto.
- Marca o serviço como pago.

### Baixa parcial

- Registra o valor pago.
- Se houver diferença, o usuário escolhe:
  - manter em aberto no serviço atual;
  - transferir para o próximo serviço.

### Transferência para o próximo serviço

- Quando uma diferença é transferida, ela fica registrada como saldo pendente global.
- O próximo serviço criado recebe automaticamente esse saldo como "saldo anterior".
- O serviço original é marcado como "transferido" para indicar que a cobrança restante saiu dele.

## 6. Entidades principais

### Configuração

- Usuário.
- Valor padrão da hora.
- Saldo pendente para o próximo serviço.

### Usuário

- ID.
- Nome.
- E-mail.
- Hash da senha.
- Salt da senha.
- Data de criação.

### Serviço

- ID.
- Usuário.
- Título.
- Cliente relacionado.
- Cliente.
- Observações.
- Data do serviço.
- Hora do serviço.
- Valor da hora.
- Moeda.
- Saldo anterior transferido.
- Desconto.
- Tipo do ajuste financeiro.
- Status.
- Data de criação.

### Lançamento de hora

- ID.
- Serviço.
- Data.
- Hora inicial.
- Hora final.
- Duração em minutos.
- Observações.

### Pagamento

- ID.
- Serviço.
- Valor.
- Observações.
- Data de registro.

### Cliente

- ID.
- Usuário.
- Nome.
- Observações.
- Data de criação.

## 7. Experiência esperada

A primeira tela deve ser operacional, sem landing page. O usuário precisa ver imediatamente:

- tela de login quando não estiver autenticado;
- tela de cadastro;
- tela de recuperação de senha;

- total em aberto;
- total pago;
- horas lançadas;
- saldo que será transferido para o próximo serviço;
- lista de serviços;
- cadastro e lista de clientes;
- formulário rápido para novo serviço;
- data e hora do serviço com nome automático;
- painel de detalhes do serviço selecionado.
- ações de editar e excluir serviço em local visível.
- modais para edição e confirmação de exclusão.

## 8. Critérios de aceite

- O sistema roda localmente com um único comando.
- O banco SQLite é criado automaticamente.
- Usuários podem se cadastrar.
- Usuários podem entrar com e-mail e senha.
- Usuários podem redefinir senha localmente.
- Dados de um usuário não aparecem para outro usuário.
- Um serviço criado usa R$ 150,00 por hora por padrão.
- Um serviço criado usa BRL por padrão.
- Um serviço pode ser criado ou editado em USD.
- Totais em BRL e USD não são somados em um único valor.
- Um serviço pode ser criado com data e hora.
- Um serviço pode ser editado por modal.
- Um serviço pode ser excluído após confirmação.
- Clientes podem ser cadastrados, editados e removidos.
- Um serviço pode ser criado ou editado com cliente relacionado.
- Quando o título fica vazio, o nome do serviço é gerado pela data e hora.
- É possível lançar 10:00 às 14:00 e o sistema calcula 4 horas.
- É possível adicionar mais períodos no mesmo serviço.
- É possível remover períodos.
- O saldo em aberto muda corretamente após pagamentos.
- Desconto e acréscimo alteram o saldo em aberto corretamente.
- Uma baixa total zera o saldo.
- Uma baixa parcial pode transferir a diferença para o próximo serviço.
- O próximo serviço criado recebe o saldo transferido automaticamente.
- O build de produção do React finaliza sem erro.
