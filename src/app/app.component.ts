import { Component, ViewChild, ElementRef } from '@angular/core';
const ELEMENT_DATA = [
  { estado: 'A', estadoUno: 'D', estadoDos: 'B' },
  { estado: 'B', estadoUno: 'D', estadoDos: 'C' },
  { estado: 'C', estadoUno: 'D', estadoDos: 'C' },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  
  displayedColumns: string[] = [
    'estado',
    'estadoUno',
    'estadoDos',
    'estadoTres',
  ];
  inputModel = '';
  displayedColumnsComp: string[] = [
    'estado',
    'estadoA',
    'estadoB',
    'composicion',
  ];
  errorInput = true;
  dataSource = [];
  dataSourceComp = [];
  linesContent = [];
  linesVertical = [];
  linesContentDeterminista = [];
  compocisiones = [];
  matriz:Array<any> = [];
  estadoAceptacion = ''; 
  contentMatrizGeneral = [];
  estadosCompociones: Array<any> = [];

  @ViewChild('UploadFileInput') uploadFileInput: ElementRef;
  myfilename = 'Seleccionar archivo';

  constructor() {
    
  }

  fileChangeEvent(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      var file = fileInput.target.files[0];

      var reader = new FileReader();
      reader.onload = function (progressEvent) {
        var results = progressEvent.target.result;

        const string: any = results;
        const lines = string.split('\n');
        this.printLines(lines);
      }.bind(this);
      reader.readAsText(file);
    } else {
      this.myfilename = 'Seleccionar archivo';
    }
  }

  printLines(lines: any) {
    this.linesContent = lines;
    const linesVe = [];
    for (let i = 0; i < lines.length; i++) {
      let title = lines[i].substr(0, 2);
      title = title.replace(':', '');
      switch (title) {
        case 'Q':
        case 'F':
        case 'i': {
            let content = lines[i].replaceAll(title, '');
            content = content.replaceAll('{', '');
            content = content.replaceAll(':', '');
            content = content.replaceAll('}', '');
            content = content.replaceAll(' ', '');
            let linesContent = content.split(',');
            let linesContentP = linesContent.map((e) => `<p>${e}</p>`);
            linesContentP = linesContentP.join('');
            linesVe.push({
              title: title,
              content: linesContentP,
            });
            break;
        }
        case 'A': {
          let content = lines[i].replaceAll(title, '');
          content = content.replaceAll('{', '');
          content = content.replaceAll(':', '');
          content = content.replaceAll('}', '');
          content = content.replaceAll(' ', '');
          this.estadoAceptacion = content.trim();
          let linesContent = content.split(',');
          let linesContentP = linesContent.map((e) => `<p>${e}</p>`);
          linesContentP = linesContentP.join('');
          linesVe.push({
            title: title,
            content: linesContentP,
          });
          break;
        }
        case 'W': {
          let content = lines[i].replaceAll(title, '');
          content = content.replaceAll('{', '');
          content = content.replaceAll(':', '');
          content = content.replaceAll('}', '');
          content = content.replaceAll(' ', '');
          content   = content.replaceAll('(', '');
          content = content.replaceAll(')', '');
          let contentMatriz = content.split(';');
          content = content.replaceAll(',', '');
          let linesContent = content.split(';');
          let estadosList = [];
          for (let i = 0; i < linesContent.length; i++) {
            let estado = linesContent[i][0];
            let notExist = true;
            for (let x = 0; x < estadosList.length; x++) {
              if (estado == estadosList[x].estado) {
                estadosList[x].redirecciones.push({
                  llave: linesContent[i][1],
                  redireccion: linesContent[i][2],
                });
                notExist = false;
              }
            }

            if (notExist) {
              estadosList.push({
                estado: estado,
                redirecciones: [
                  {
                    llave: linesContent[i][1],
                    redireccion: linesContent[i][2],
                  },
                ],
              });
            }
          }
          this.dataSource = estadosList.map((e) => {
            let obj = {
              estado: e.estado,
              estadoUno: '',
              estadoDos: '',
              estadoTres: '',
            };
            for (let i = 0; i < e.redirecciones.length; i++) {
              switch (e.redirecciones[i].llave) {
                case 'a': {
                  obj.estadoUno = e.redirecciones[i].redireccion;
                  break;
                }
                case 'b': {
                  obj.estadoDos = e.redirecciones[i].redireccion;
                  break;
                }
                case 'e': {
                  obj.estadoTres = e.redirecciones[i].redireccion;
                  break;
                }
              }
            }

            return obj;
          });
          this.contentMatrizGeneral = contentMatriz;
          this.printAFD(contentMatriz);
          break;
        }
        default: {
        }
      }
    }

    this.linesVertical = linesVe;
  }

  printAFD(contentMatriz:any) {
    const matriz = contentMatriz.map(e => e.split(','));
    this.matriz = matriz;
    const abs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    let estado = matriz[0][0];
    let composicion = estado;

    for (let i = 0; i < matriz.length; i++) {
      if (estado == matriz[i][0] && matriz[i][1] == 'e') {
        composicion += matriz[i][2];
        estado = matriz[i][2];
      }
    }

    const nuevaComposicion = {
      estado: abs.shift(),
      composicion: composicion,
      read: false,
    };
    let composiciones: Array<any> = [nuevaComposicion];
    
    for (let i = 0; i < composiciones.length; i++) {
      if (!composiciones[ i].read) {
        let obj = {
          estado: composiciones[i].estado,
          composicion: composiciones[i].composicion,
          estadoA: '',
          estadoB: '',
        };
        let compociA = this.encontrarComposicion(composiciones[i].composicion,'a',matriz );
        let existCompA = this.existeLaComposicion(compociA, composiciones);
        if (existCompA) {
          obj.estadoA = existCompA;
        } else {
          let estado = abs.shift();
          composiciones.push({
            estado: estado,
            composicion: compociA ?  compociA : '',
            read: false,
          });
          obj.estadoA = estado;
        }
        let compociB = this.encontrarComposicion(composiciones[i].composicion, 'b',  matriz );
        let existCompB = this.existeLaComposicion(compociB, composiciones);
        if (existCompB) {
          obj.estadoB = existCompB;
        } else {
          let estado = abs.shift();
          composiciones.push({
            estado: estado,
            composicion: compociB ? compociB : '',
            read: false,

          });
          obj.estadoB = estado;
        }

        this.estadosCompociones.push(obj);
        composiciones[i].read = true;
      }
    }

    this.dataSourceComp = this.estadosCompociones.map(e => ({...e, composicion: e.composicion ? e.composicion.split("").join(',') : '0'}));
    this.generarAutomataDeterministaFinito(this.estadosCompociones);
  }

  generarAutomataDeterministaFinito(estadosCompociones ) {
    try {
      const aceptEstados = estadosCompociones.filter( e => e.composicion.endsWith(this.estadoAceptacion) == true);
      let Q = `Q: {${estadosCompociones.map(e => e.estado).join(',')}}`;
      let F = `F: {a, b} `;
      let I = `i: A`;
      let A = `A: {${estadosCompociones.filter( e => e.composicion.endsWith(this.estadoAceptacion) == true).map(e => e.estado).join(",")}}`
      this.linesContentDeterminista = [Q , F , I , A];
    } catch (err) {
      console.log('err generarAutomataDeterministaFinito', err);
    }

  }

  encontrarComposicion(composicion, letra, matriz) {
    let nuevaComposicion = '';

    let ultipoEstado = false;
    for (let i = 0; i < matriz.length; i++) {
      if (composicion.includes(matriz[i][0]) && matriz[i][1] == letra) {
        ultipoEstado = true;
        if (!nuevaComposicion.includes(matriz[i][2])) {
          nuevaComposicion += matriz[i][2];
        }
      }
      if (
        ultipoEstado &&
        composicion.includes(matriz[i][0]) &&
        matriz[i][1] == 'e'
      ) {
        ultipoEstado = false;
        if (!nuevaComposicion.includes(matriz[i][2])) {
          nuevaComposicion += matriz[i][2];
        }
      }
    }
    return nuevaComposicion;
  }

  existeLaComposicion(composicion, composiciones): any {
    let estadoCompo = '';
    for (let i = 0; i < composiciones.length; i++) {
      if (composiciones[i].composicion == composicion) {
        estadoCompo = composiciones[i].estado;
      }
    }
    return estadoCompo;
  }

  markComposicion(estado) {
    let constComp = this.compocisiones.map((composicion) => {
      if (composicion.estado == estado) {
        composicion.read = true;
      }
    });
    this.compocisiones = constComp;
  }

  changeInputModel(text) {
    this.validCadena(text);
  }

  validCadena(cadena) {
    const cadenaList = cadena;
    console.log("cadenaList", cadenaList);
    console.log("cadena validar", cadena);
    console.log("matriz", this.matriz);
    console.log("dataSource", this.dataSource);
    let valid = true;
    let ultimoEstado = '';
    let estadosAnterioresValidos = [];
    for(let i = 0; i < cadenaList.length ; i ++) {
      let letra = cadenaList[i];
      
      for(let x = 0; x < this.matriz.length; x++) {
        if(this.matriz[1] == letra) {
          estadosAnterioresValidos.push(this.matriz[2]);
        }
      }
    }

  }

  
}
