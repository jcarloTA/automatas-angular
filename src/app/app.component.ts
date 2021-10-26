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
  title = 'angular-material-file-upload-app';
  displayedColumns: string[] = ['estado', 'estadoUno', 'estadoDos'];

  dataSource = [];
  linesContent = [];
  linesVertical = [];

  @ViewChild('UploadFileInput') uploadFileInput: ElementRef;
  myfilename = 'Seleccionar archivo';

  constructor() {}

  fileChangeEvent(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      console.log('files', fileInput.target.files);
      var file = fileInput.target.files[0];

      var reader = new FileReader();
      reader.onload = function (progressEvent) {
        var results = progressEvent.target.result;

        const string: any = results;
        const lines = string.split('\n');
        console.log('lines', lines);
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
    console.log('print lines', lines);
    for (let i = 0; i < lines.length; i++) {
      let title = lines[i].substr(0, 2);
      title = title.replace(':', '');
      switch (title) {
        case 'Q':
        case 'F':
        case 'i':
        case 'A': {
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
        case 'W': {
          let content = lines[i].replaceAll(title, '');
          content = content.replaceAll('{', '');
          content = content.replaceAll(':', '');
          content = content.replaceAll('}', '');
          content = content.replaceAll(' ', '');
          content = content.replaceAll('(', '');
          content = content.replaceAll(')', '');
          content = content.replaceAll(',', '');
          let linesContent = content.split(';');
          console.log('linesContent', linesContent);
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
          console.log('estadosList', estadosList);
          this.dataSource = estadosList.map((e) => ({
            estado: e.estado,
            estadoUno: e.redirecciones[0].redireccion,
            estadoDos: e.redirecciones[1].redireccion,
          }));
          break;
        }
        default: {
        }
      }
    }

    this.linesVertical = linesVe;
  }
}
