/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { Instance } from '../../../../entities/instance/instance';
import { InstanceService } from '../../../../services-ngx/instance.service';
import { GioTableWrapperFilters } from '../../../../shared/components/gio-table-wrapper/gio-table-wrapper.component';
import { gioTableFilterCollection } from '../../../../shared/components/gio-table-wrapper/gio-table-wrapper.util';
import { LanguageService } from '../../../../shared/i18n/language.service';

type InformationItemDS = {
  icon: string;
  typeKey: string;
  type: string;
  value: string;
  displayValue?: string;
  class?: string;
}[];

type PluginItemDS = {
  icon: string;
  id: string;
  name: string;
  version: string;
}[];

type SystemPropertyItemDS = {
  name: string;
  value: string;
}[];

@Component({
  selector: 'instance-details-environment',
  templateUrl: './instance-details-environment.component.html',
  styleUrls: ['./instance-details-environment.component.scss'],
  standalone: false,
})
export class InstanceDetailsEnvironmentComponent implements OnInit, OnDestroy {
  public instance: Instance;
  public hasSystemProperties = false;

  public informationItemsDS: InformationItemDS;
  public filteredInformationItemsDS: InformationItemDS;
  public informationTableDisplayedColumns = ['icon', 'type', 'value'];
  public informationTableUnpaginatedLength: number;
  public informationTableFilters: GioTableWrapperFilters = {
    pagination: { index: 1, size: 10 },
    searchTerm: '',
  };

  public pluginsItemsDS: PluginItemDS;
  public filteredPluginsItemsDS: PluginItemDS;
  public pluginsTableDisplayedColumns = ['icon', 'id', 'name', 'version'];
  public pluginsTableUnpaginatedLength: number;
  public pluginsTableFilters: GioTableWrapperFilters = {
    pagination: { index: 1, size: 10 },
    searchTerm: '',
  };

  public propertiesItemsDS: SystemPropertyItemDS;
  public filteredPropertiesItemsDS: SystemPropertyItemDS;
  public propertiesTableDisplayedColumns = ['name', 'value'];
  public propertiesTableUnpaginatedLength: number;
  public propertiesTableFilters: GioTableWrapperFilters = {
    pagination: { index: 1, size: 10 },
    searchTerm: '',
  };
  private unsubscribe$ = new Subject<void>();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly instanceService: InstanceService,
    private readonly languageService: LanguageService,
    private readonly injector: Injector,
  ) {}

  ngOnInit(): void {
    this.instanceService
      .get(this.activatedRoute.snapshot.params.instanceId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(instance => {
        this.instance = instance;

        this.hasSystemProperties = this.instance.systemProperties ? Object.keys(this.instance.systemProperties).length > 0 : false;

        this.initInformationTable();
        this.initPluginsTable();
        this.initPropertiesTable();

        this.onInformationFiltersChanged(this.informationTableFilters);
        this.onPluginsFiltersChanged(this.pluginsTableFilters);
        this.onPropertiesFiltersChanged(this.propertiesTableFilters);
      });

    toObservable(this.languageService.currentLanguage, { injector: this.injector })
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (!this.instance) {
          return;
        }
        this.initInformationTable();
        this.onInformationFiltersChanged(this.informationTableFilters);
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.unsubscribe();
  }

  get tocSectionNames(): Record<string, string> {
    return { '': this.languageService.translate('gateways.details.tabs.environment') };
  }

  private infoLabel(key: string): string {
    return this.languageService.translate(`gateways.environment.info.${key}`);
  }

  private statusLabel(state: string): string {
    const key = `gateways.status.${state.toLowerCase()}`;
    const translated = this.languageService.translate(key);
    return translated === key ? state : translated;
  }

  private initInformationTable() {
    this.informationItemsDS = [
      {
        icon: 'gio:building',
        typeKey: 'hostname',
        type: this.infoLabel('hostname'),
        value: this.instance.hostname,
      },
      {
        icon: 'gio:wifi',
        typeKey: 'ip',
        type: this.infoLabel('ip'),
        value: this.instance.ip,
      },
      {
        icon: 'gio:wifi',
        typeKey: 'port',
        type: this.infoLabel('port'),
        value: this.instance.port,
      },
      {
        icon: this.getIconFromState(this.instance.state),
        typeKey: 'state',
        type: this.infoLabel('state'),
        value: this.instance.state,
        displayValue: this.statusLabel(this.instance.state),
        class: this.getClassFromState(this.instance.state),
      },
      {
        icon: 'gio:flag',
        typeKey: 'version',
        type: this.infoLabel('version'),
        value: this.instance.version,
      },
      {
        icon: 'gio:clock-outline',
        typeKey: 'startedAt',
        type: this.infoLabel('startedAt'),
        value: formatDate(this.instance.started_at, 'medium', 'en-US'),
      },
      {
        icon: 'gio:heart',
        typeKey: 'lastHeartbeatAt',
        type: this.infoLabel('lastHeartbeatAt'),
        value: formatDate(this.instance.last_heartbeat_at, 'medium', 'en-US'),
      },
    ];

    if (this.instance.tags?.length > 0) {
      this.informationItemsDS.push({
        icon: 'gio:label-outline',
        typeKey: 'shardingTags',
        type: this.infoLabel('shardingTags'),
        value: this.instance.tags.join(', '),
      });
    }

    if (this.instance.tenant) {
      this.informationItemsDS.push({
        icon: 'gio:data-transfer-both',
        typeKey: 'tenant',
        type: this.infoLabel('tenant'),
        value: this.instance.tenant,
      });
    }

    if (this.instance.organizations_hrids?.length > 0) {
      this.informationItemsDS.push({
        icon: 'gio:product-apim',
        typeKey: 'organizations',
        type: this.infoLabel('organizations'),
        value: this.instance.organizations_hrids.join(', '),
      });
    }

    if (this.instance.environments_hrids?.length > 0) {
      this.informationItemsDS.push({
        icon: 'gio:server',
        typeKey: 'environments',
        type: this.infoLabel('environments'),
        value: this.instance.environments_hrids.join(', '),
      });
    }

    if (this.instance.stopped_at) {
      this.informationItemsDS.push({
        icon: 'gio:power',
        typeKey: 'stoppedAt',
        type: this.infoLabel('stoppedAt'),
        value: formatDate(this.instance.stopped_at, 'medium', 'en-US'),
      });
    }
  }

  private getIconFromState(state: string): string {
    if (state === 'STARTED') {
      return 'gio:play-circle';
    }
    if (state === 'STOPPED') {
      return 'gio:stop-circle';
    }
  }

  private getClassFromState(state: string): string {
    if (state === 'STARTED') {
      return 'gio-instance-details-environment__started';
    }
    if (state === 'STOPPED') {
      return 'gio-instance-details-environment__stopped';
    }
  }

  private initPluginsTable() {
    const pluginIcon = {
      policy: 'gio:data-transfer-both',
      service: 'gio:layers',
      service_discovery: 'gio:layers',
      repository: 'gio:folder',
      reporter: 'gio:report-columns',
      resource: 'gio:package',
      connector: 'gio:server-connection',
      tracer: 'gio:pen-tool',
      'endpoint-connector': 'gio:server-connection',
      'entrypoint-connector': 'gio:server-connection',
      alert: 'gio:shield-alert',
    };

    this.pluginsItemsDS = this.instance.plugins?.map(plugin => {
      const pluginItem = {
        id: plugin.id,
        icon: pluginIcon[plugin.type],
        name: plugin.name,
        version: plugin.version,
      };
      return pluginItem;
    });
  }

  private initPropertiesTable() {
    if (this.hasSystemProperties) {
      this.propertiesItemsDS = Object.entries(this.instance.systemProperties).map(([name, value]) => {
        const propertyItem = { name, value };
        return propertyItem;
      });
    }
  }

  onInformationFiltersChanged(filters: GioTableWrapperFilters) {
    this.informationTableFilters = filters;
    const filtered = gioTableFilterCollection(this.informationItemsDS, filters);
    this.filteredInformationItemsDS = filtered.filteredCollection;
    this.informationTableUnpaginatedLength = filtered.unpaginatedLength;
  }

  onPluginsFiltersChanged(filters: GioTableWrapperFilters) {
    this.pluginsTableFilters = filters;
    const filtered = gioTableFilterCollection(this.pluginsItemsDS, filters);
    this.filteredPluginsItemsDS = filtered.filteredCollection;
    this.pluginsTableUnpaginatedLength = filtered.unpaginatedLength;
  }

  onPropertiesFiltersChanged(filters: GioTableWrapperFilters) {
    this.propertiesTableFilters = filters;
    const filtered = gioTableFilterCollection(this.propertiesItemsDS, filters);
    this.filteredPropertiesItemsDS = filtered.filteredCollection;
    this.propertiesTableUnpaginatedLength = filtered.unpaginatedLength;
  }
}
