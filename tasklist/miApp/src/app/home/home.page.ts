import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonInput, IonList, IonIcon, IonItemSliding, IonItemOptions, IonItemOption, IonReorderGroup, IonReorder } from '@ionic/angular/standalone';
import { Task } from '../models/task.models';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { AlertService } from '../services/alert';
import { ItemReorderEventDetail } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonInput, IonList, IonIcon, IonItemSliding, IonItemOptions, IonItemOption, IonReorderGroup, IonReorder, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  newTaskStr: string = '';
  tasks: Task[] = [];

  constructor(private alertService: AlertService) {
    addIcons({ addOutline, trashOutline });
  }

  async ngOnInit() {
    await this.loadTasks();
  }

  async loadTasks() {
    const { value } = await Preferences.get({ key: 'tasks' });
    if (value) {
      this.tasks = JSON.parse(value);
    } else {
      this.tasks = [
        {
          id: 1,
          title: "Configuración de Ionic",
          description: "Instalar Node.js, AngularCli, Ionic",
          completed: true,
          priority: "High"
        },
        {
          id: 2,
          title: "Crear app tasklist",
          description: "Crear el proyecto inicial de Ionic con Angular",
          completed: false,
          priority: "Medium"
        }
      ];
      await this.saveTasks();
    }
  }

  async saveTasks() {
    await Preferences.set({ key: 'tasks', value: JSON.stringify(this.tasks) });
  }

  saludar() {
    console.log("¡Hola, Ionic!");
  }

  async addTask() {
    const trimmed = this.newTaskStr.trim();

    if (!trimmed) {
      await this.alertService.presentAlert('Error', 'El título no puede estar vacío');
      return;
    }

    const duplicate = this.tasks.some(t => t.title.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      await this.alertService.presentAlert('Error', 'Ya existe una tarea con ese título');
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: trimmed,
      description: '',
      completed: false,
      priority: 'Medium'
    };

    this.tasks.push(newTask);
    this.newTaskStr = '';
    await this.saveTasks();
  }

  async deleteTask(id: number) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    await this.saveTasks();
  }

  async reorderTasks(event: CustomEvent<ItemReorderEventDetail>) {
    this.tasks = event.detail.complete(this.tasks);
    await this.saveTasks();
  }
}