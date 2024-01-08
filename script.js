console.log("teste");

// URL da API de produtos
let url = "http://localhost:8080/produtos";

// Função para obter o JSON de uma resposta HTTP
async function obterJsonResposta(resposta) {
    if (!resposta.ok) {
        throw new Error(`${resposta.status} - ${resposta.statusText}`);
    }

    const contentType = resposta.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return null;
    }

    return resposta.json();
}

// Função para obter a lista de produtos da API
async function obterProdutos() {
    const resposta = await fetch(url);
    return obterJsonResposta(resposta);
}

// Função para incluir um novo produto na API
async function incluirProdutoAPI(data) {
    const resposta = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json;charset=UTF-8'
        }
    });

    return obterJsonResposta(resposta);
}

// Função para editar um produto na API
async function editarProduto(data, id) {
    const resposta = await fetch(`${url}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json;charset=UTF-8'
        }
    });

    try {
        if (!resposta.ok) {
            const mensagemErro = await resposta.text();
            throw new Error(`${resposta.status} - ${resposta.statusText}\n${mensagemErro}`);
        }

        const jsonResposta = await resposta.json();
        return jsonResposta;
    } catch (error) {
        console.error('Erro ao processar resposta de edição:', error);
        throw error;
    }
}

// Função para deletar um produto da API
async function deletarProduto(id) {
    const resposta = await fetch(`${url}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json;charset=UTF-8'
        }
    });
    return obterJsonResposta(resposta);
}

// Função para criar uma célula na tabela
function criarCelulaTabela(linha, conteudo) {
    const coluna = document.createElement('td');
    coluna.textContent = conteudo;
    linha.appendChild(coluna);
}

// Função para criar um botão de ação na tabela
function criarBotaoAcao(rotulo, onClickHandler) {
    const botao = document.createElement('button');
    botao.textContent = rotulo;
    botao.addEventListener('click', onClickHandler);
    return botao;
}

// Função assíncrona para exibir os produtos na tabela HTML
async function exibirProdutosNaTabela() {
    const produtos = await obterProdutos();
    const tabelaCorpo = document.getElementById('tabela-corpo');
    const tabelaCabecalho = document.getElementById('tabela-cabecalho');

    // Limpa a tabela antes de adicionar novos dados
    tabelaCorpo.innerHTML = '';
    tabelaCabecalho.innerHTML = '';

    // Cria uma linha de cabeçalho na tabela
    const linhaCabecalho = document.createElement('tr');
    criarCelulaTabela(linhaCabecalho, 'Nome');
    criarCelulaTabela(linhaCabecalho, 'Descrição');
    criarCelulaTabela(linhaCabecalho, 'Código');
    criarCelulaTabela(linhaCabecalho, 'Preço');
    criarCelulaTabela(linhaCabecalho, '');  // Cabeçalho vazio para as ações
    tabelaCabecalho.appendChild(linhaCabecalho);

    // Preenche a tabela com os dados dos produtos
    produtos.forEach(produto => {
        const linha = document.createElement('tr');
        criarCelulaTabela(linha, produto.nomeProduto);
        criarCelulaTabela(linha, produto.descricaoProduto);
        criarCelulaTabela(linha, produto.codigoProduto);
        criarCelulaTabela(linha, produto.precoProduto !== null ? produto.precoProduto.toFixed(2) : '');

        const colAcoes = document.createElement('td');

        const btnEditar = criarBotaoAcao('Editar', () => abrirFormularioEditar(produto));
        colAcoes.appendChild(btnEditar);

        const btnExcluir = criarBotaoAcao('Excluir', () => confirmarExclusao(produto.id));
        colAcoes.appendChild(btnExcluir);

        linha.appendChild(colAcoes);

        tabelaCorpo.appendChild(linha);
    });
}

// Função para remover o botão "Salvar" do formulário
function removerBotaoSalvar() {
    const btnSalvar = document.getElementById('btn-salvar');
    if (btnSalvar) {
        btnSalvar.style.display = 'none';  // Oculta o botão
        btnSalvar.onclick = null;  // Remove o manipulador de clique
    }
}

// Função para abrir o formulário de edição com os dados de um produto
function abrirFormularioEditar(produto) {
    console.log('Abrindo formulário para edição:', produto);

    // Obtém referências aos elementos do formulário
    const form = document.getElementById('formulario-edicao');
    const inputNome = document.getElementById('input-nome');
    const inputDescricao = document.getElementById('input-descricao');
    const inputCodigo = document.getElementById('input-codigo');
    const inputPreco = document.getElementById('input-preco');
    const btnSalvar = document.querySelector('#formulario-edicao button');

    // Limpa os ouvintes de eventos anteriores do botão "Salvar"
    btnSalvar.removeEventListener('click', () => editarProdutoNoFormulario(produto.id));
    btnSalvar.removeEventListener('click', incluirNovoProdutoNoFormulario);

    // Preenche os campos do formulário com os dados do produto
    inputNome.value = produto.nomeProduto;
    inputDescricao.value = produto.descricaoProduto;
    inputCodigo.value = produto.codigoProduto || '';
    inputPreco.value = produto.precoProduto;

    // Adiciona o evento de clique diretamente no botão "Salvar"
    btnSalvar.addEventListener('click', () => {
        console.log('Botão Salvar clicado no formulário de edição');
        if (produto.id !== undefined) {
            console.log('Editando produto no formulário', produto.id);
            editarProdutoNoFormulario(produto.id);
        } else {
            incluirNovoProdutoNoFormulario();
        }
    });

    // Exibe o formulário e o botão "Salvar"
    form.style.display = 'block';
    btnSalvar.style.display = 'block';
}

// Função para limpar o formulário de edição
function limparFormulario() {
    const inputNome = document.getElementById('input-nome');
    const inputDescricao = document.getElementById('input-descricao');
    const inputCodigo = document.getElementById('input-codigo');
    const inputPreco = document.getElementById('input-preco');

    inputNome.value = '';
    inputDescricao.value = '';
    inputCodigo.value = '';
    inputPreco.value = '';

    // Se houver um botão Salvar, remove todos os ouvintes de eventos associados
    const btnSalvar = document.querySelector('#formulario-edicao button');
    if (btnSalvar) {
        btnSalvar.removeEventListener('click', editarProdutoNoFormulario);
        btnSalvar.removeEventListener('click', incluirNovoProdutoNoFormulario);
    }

    // Oculta o formulário
    const form = document.getElementById('formulario-edicao');
    form.style.display = 'block';
}

// Função assíncrona para incluir um novo produto a partir do formulário
async function incluirNovoProdutoNoFormulario() {
    const nome = document.getElementById('input-nome').value;
    const descricao = document.getElementById('input-descricao').value;
    const codigo = document.getElementById('input-codigo').value;
    const preco = parseFloat(document.getElementById('input-preco').value);

    const novoProduto = {
        nomeProduto: nome,
        descricaoProduto: descricao,
        precoProduto: preco,
        codigoProduto: parseInt(codigo, 10) // Garante que o valor é um inteiro
    };

    try {
        // Adiciona o novo produto
        const resposta = await incluirProdutoAPI(novoProduto);
        console.log(resposta);

        // Oculta o formulário após a adição
        const form = document.getElementById('formulario-edicao');
        form.style.display = 'none';

        // Atualiza a tabela após a adição
        exibirProdutosNaTabela();
    } catch (error) {
        console.error('Erro ao adicionar o novo produto:', error);
    }
}

// Função assíncrona para editar um produto a partir do formulário
async function editarProdutoNoFormulario(id) {
    console.log('Editando produto no formulário', id);

    const nome = document.getElementById('input-nome').value;
    const descricao = document.getElementById('input-descricao').value;
    const codigo = document.getElementById('input-codigo').value;
    const preco = parseFloat(document.getElementById('input-preco').value);

    const dadosAtualizados = {
        nomeProduto: nome,
        descricaoProduto: descricao,
        precoProduto: parseFloat(preco),
        codigoProduto: parseInt(codigo, 10)
    };

    try {
        console.log('Antes da chamada a editarProduto');
        // Certifica-se de que o ID não seja undefined
        if (!id) {
            throw new Error('ID do produto indefinido ao tentar editar.');
        }

        // Chama a função de editarProduto com os dados atualizados
        const resposta = await editarProduto(dadosAtualizados, id);
        console.log('Depois da chamada a editarProduto:', resposta);


       // Atualize o formulário com os dados editados
abrirFormularioEditar({
    id: id,
    nomeProduto: resposta.nomeProduto,
    descricaoProduto: resposta.descricaoProduto,
    precoProduto: resposta.precoProduto,
    codigoProduto: resposta.codigoProduto
});

// Atualize a tabela com os produtos
exibirProdutosNaTabela();

// Adicione o produto recém-editado à tabela
incluirProduto();

// Adicione o botão "Salvar" após a edição bem-sucedida
adicionarBotaoSalvar(() => editarProdutoNoFormulario(id));

// Limpe o formulário após a edição bem-sucedida
limparFormulario();
} catch (error) {
    // Trate qualquer erro que ocorra durante a edição do produto
    console.error(`Erro ao editar o produto: ${error.message}`);
    console.log('Detalhes do erro:', error);
} finally {
    // Remova o botão "Salvar" se não tiver sido adicionado
    removerBotaoSalvar();
}
}
// Exiba no console o elemento do botão com o ID 'btn-salvar'
console.log(document.getElementById('btn-salvar'));

// Função para fechar o formulário de edição
function fecharFormulario() {
    const form = document.getElementById('formulario-edicao');
    form.style.display = 'none';

    // Use querySelector para selecionar o botão de salvar dentro do formulário
    const btnSalvar = form.querySelector('button');
    if (btnSalvar) {
        // Remova os ouvintes de eventos associados ao botão de salvar
        btnSalvar.removeEventListener('click', editarProdutoNoFormulario);
        btnSalvar.removeEventListener('click', incluirNovoProdutoNoFormulario);
    }
}

// Função para confirmar a exclusão de um produto
function confirmarExclusao(id) {
    // Exiba um prompt de confirmação ao usuário
    const confirmacao = confirm("Tem certeza que deseja excluir este produto?");
    if (confirmacao) {
        // Se confirmado, chame a função para deletar o produto e atualize a tabela
        deletarProduto(id).then(() => exibirProdutosNaTabela());
    }
}

// Função assíncrona para incluir um novo produto
async function incluirProduto() {
    // Obtenha os valores dos campos do formulário
    const nome = document.getElementById('input-nome').value;
    const descricao = document.getElementById('input-descricao').value;
    const inputCodigo = document.getElementById('input-codigo').value;
    const preco = parseFloat(document.getElementById('input-preco').value);

    // Crie um objeto com os dados do novo produto
    const dadosProduto = {
        nomeProduto: nome,
        descricaoProduto: descricao,
        precoProduto: preco,
        codigoProduto: parseInt(inputCodigo, 10) // Garante que o valor é um inteiro
    };

    try {
        // Chame a função para incluir o novo produto e exiba a resposta no console
        const resposta = await incluirProdutoAPI(dadosProduto);
        console.log(resposta);

        // Atualize a tabela após a inclusão do novo produto
        exibirProdutosNaTabela();
    } catch (error) {
        // Trate qualquer erro que ocorra durante a inclusão do novo produto
        console.error(error);
    }

    // Limpe os campos do formulário após a inclusão do novo produto
    document.getElementById('input-nome').value = '';
    document.getElementById('input-descricao').value = '';
    document.getElementById('input-codigo').value = '';
    document.getElementById('input-preco').value = '';
}

// Exiba os produtos na tabela inicialmente
exibirProdutosNaTabela();
