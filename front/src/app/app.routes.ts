import { Routes } from '@angular/router';
import { FileBrowserComponent } from './components/file-browser/file-browser.component';

export const routes: Routes = [

    { path: '', pathMatch: 'full', component: FileBrowserComponent },
    { path: 'fileBrowser', component: FileBrowserComponent },
    { path: '**', redirectTo: '' }
];
