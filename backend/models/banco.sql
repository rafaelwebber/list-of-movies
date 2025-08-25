
CREATE TABLE filmes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR (100) NOT NULL,
    genero VARCHAR(100) NOT NULL,
    ano INT NOT NULL,
    imagem_url VARCHAR (255)
); 

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR (100) NOT NULL,
    senha VARCHAR (100) NOT NULL,
    data_nascimento DATE NOT NULL
);

CREATE TABLE usuario_filme (
    usuario_id INT,
    filme_id INT,
    PRIMARY KEY (usuario_id, filme_id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (filme_id) REFERENCES filme(id)
);