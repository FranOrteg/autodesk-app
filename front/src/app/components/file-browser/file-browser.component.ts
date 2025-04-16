import { Component, OnInit } from '@angular/core';
import { AccService } from '../../services/acc.service';
import { NgFor, NgIf } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-browser',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './file-browser.component.html',
  styleUrl: './file-browser.component.css'
})
export class FileBrowserComponent implements OnInit {

  labitHubId: string = 'b.1bb899d4-8dd4-42d8-aefd-6c0e35acd825';
  arrProjects: any[] = [];
  arrProjectContents: any[] = [];
  projectIdSelected: string = '';
  fileIdSelected: string = '';
  fileIdEncoded: string = '';
  fileVersion: string = '';
  fileVersionTranslate: string = '';
  fileStatus: any = {};
  formulario: FormGroup;

  constructor(private accService: AccService) { 
    this.formulario = new FormGroup({});
  }

  async ngOnInit() {
    try {
      this.arrProjects = await this.accService.getProjects(this.labitHubId);
      console.log('Projects:', this.arrProjects); 
  
    } catch (error) {
      console.error('Error fetching projects:', error);
      this.arrProjects = [];
    }
  }

  onProjectChange(event:any){
    const selectedProjectId = event.target.value;
    console.log('Project ID:', selectedProjectId);
    this.selectProject(selectedProjectId);
    this.arrProjectContents = [];
  }

  async selectProject(projectId: string) {
    
    this.projectIdSelected = projectId;

    try {
      this.arrProjectContents = await this.accService.listProjectContents(this.labitHubId, projectId);
      console.log('Archivos RVT:', this.arrProjectContents);
    } catch (error) {
      console.error('Error al listar contenidos:', error);
      this.arrProjectContents = [];
    }
  }
  
  async selectFile(fileId: string) {
    this.fileIdSelected = fileId;
    this.fileIdEncoded = encodeFileIdToUrn(fileId);

    console.log('File ID:', this.fileIdSelected);
    
    try {
      this.fileVersion = await this.accService.getFileVersion(this.projectIdSelected, fileId);
      console.log('Version:', this.fileVersion);
      
      this.fileVersionTranslate = encodeFileIdToUrn(this.fileVersion);
      console.log('Version Translate:', this.fileVersionTranslate);
  
      const metadataResponse = await this.accService.listFileMetadata(this.fileVersionTranslate);
      console.log('Metadata:', metadataResponse);
  
      // Validar que la respuesta tiene la estructura esperada
      if (metadataResponse && metadataResponse.data && metadataResponse.data.metadata) {
        this.fileStatus = metadataResponse;
      } else {
        console.error('Respuesta inesperada al obtener metadatos:', metadataResponse);
        this.fileStatus = {}; // Asegurar que no sea string
      }
    } catch (error) {
      console.error('Error al obtener los metadatos:', error);
      this.fileStatus = {}; // Evitar errores posteriores
    }
  }
  

  async onSubmit(){
    if(!this.fileIdEncoded || !this.fileStatus){
      console.error('No hay un archivo seleccionado o no se han obtenido los metadatos.');
      return;
    }

    // Extraer el URN del archivo y el GUID del modelo
    const urnId = this.fileIdSelected;
    const urnIdTranslate = this.fileVersionTranslate;
    const metadataArray = this.fileStatus.data.metadata;
    
    try {

      // Obtener el nombre del proyecto
      const data = await this.accService.getProjectById(this.labitHubId, this.projectIdSelected);
      console.log('Datos del proyecto:', data);

      if (!data || !data.data || !data.data.attributes || !data.data.attributes.name) {
        console.error('Error: No se pudo obtener el nombre del proyecto.');
        return;
      }

      const projectName = data.data.attributes.name; 
      console.log('Nombre del proyecto:', projectName);

      // Buscar el guid correcto
      const metadata = metadataArray.find((item: any) => item.role === '3d');

      if(!metadata){
        console.error('No se encontró el GUID valido');
        return;
      }

      const guid = metadata.guid;
      console.log('Obteniendo propiedades del modelo:', { urnIdTranslate, guid });

      // Obtener las propiedades del modelo desde APS
      const response = await this.accService.getProperties(urnIdTranslate, guid);

      if (!response || !response.data || !response.data.collection) {
        console.error('Error: Datos de propiedades no encontrados en la respuesta.', response);
        return;
      }
      
      const elements = response.data.collection;
      console.log('Elementos:', elements);

      // Formatear los datos para la inserción
      const formattedElements = elements.map((element: any) => ({
        objectid: element.objectid,
        name: element.name,
        externalId: element.externalId,
        type: 'element'
      }));
      console.log("Formatted Elements: ", formattedElements);
      
      const formattedProperties = elements.flatMap((element: any) => {
        const elementId = element.objectid;
        return Object.entries(element.properties || {}).flatMap(([category, properties]: any) => {
          return Object.entries(properties).map(([propertyName, propertyValue]: any) => ({
            element_id: elementId,
            category: category,
            property_name: propertyName,
            property_value: propertyValue.toString(), // Convertir a string en caso de ser objeto/array
          }));
        });
      });

      console.log("Formatted Properties: ", formattedProperties);

      // 3️⃣ Enviar los datos al backend para ser almacenados en MySQL
      console.log('Enviando al backend los elementos:', formattedElements);
      console.log('Enviando al backend las propiedades:', formattedProperties);

      // Almacenar los datos en MySQL
      //await this.accService.saveModelData(projectName, urnId, formattedElements, formattedProperties);
      
      // Subir Fichero al vector Store de OPEN AI
      await this.accService.uploadModelToVectorStore(projectName, urnId, formattedElements, formattedProperties);


      console.log('Datos almacenados exitosamente en la base de datos.');
    } catch (error) {
        console.error('Error al enviar los datos:', error);
    }
  }
  
}


function encodeFileIdToUrn(fileId: string) {
    
  // Codificar en Base64
  let base64Encoded = btoa(unescape(encodeURIComponent(fileId)));

  // Reemplazar caracteres
  base64Encoded = base64Encoded.replace(/=/g, "")  // Quitar '=' de relleno
                               .replace(/\//g, "_") // Reemplazar '/' por '_'
                               .replace(/\+/g, "-"); // Reemplazar '+' por '-'

  return base64Encoded;
}