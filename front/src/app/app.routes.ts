import { Routes } from '@angular/router';
import { FileBrowserComponent } from './components/file-browser/file-browser.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [

    { path: '', pathMatch: 'full', component: HomeComponent },
    { path: 'fileBrowser', component: FileBrowserComponent },
    { path: '**', redirectTo: '' }
];
