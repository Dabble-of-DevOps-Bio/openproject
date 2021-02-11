
import {HalResource} from 'core-app/modules/hal/resources/hal-resource';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {I18nService} from 'core-app/modules/common/i18n/i18n.service';
import {AngularTrackingHelpers} from 'core-components/angular/tracking-functions';
import {HalResourceService} from 'core-app/modules/hal/services/hal-resource.service';
import {HalResourceSortingService} from 'core-app/modules/hal/services/hal-resource-sorting.service';
import {NgSelectComponent} from '@ng-select/ng-select';
import {APIV3Service} from 'core-app/modules/apiv3/api-v3.service';
import { DebouncedRequestSwitchmap, errorNotificationHandler } from 'core-app/helpers/rxjs/debounced-input-switchmap';
import { Observable } from 'rxjs';
import { HalResourceNotificationService } from 'core-app/modules/hal/services/hal-resource-notification.service';
import { CurrentProjectService } from 'core-app/components/projects/current-project.service';
import { ApiV3FilterBuilder, FilterOperator } from 'core-app/components/api/api-v3/api-v3-filter-builder';
import { map } from 'rxjs/operators';
import { APIv3ResourceCollection } from 'core-app/modules/apiv3/paths/apiv3-resource';
import { UserResource } from 'core-app/modules/hal/resources/user-resource';
import { APIv3UserPaths } from 'core-app/modules/apiv3/endpoints/users/apiv3-user-paths';
import { APIV3WorkPackagePaths } from 'core-app/modules/apiv3/endpoints/work_packages/api-v3-work-package-paths';
import { WorkPackageResource } from 'core-app/modules/hal/resources/work-package-resource';
import { UntilDestroyedMixin } from 'core-app/helpers/angular/until-destroyed.mixin';

export interface Conditions {name:string; operator:FilterOperator; values:unknown[]|boolean; }

@Component({
  selector: 'general-wp-autocompleter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl:'./general-wp-autocompleter.component.html'
})


export class GeneralWorkPackageAutocompleterComponent extends UntilDestroyedMixin implements OnInit {

  @Input() public conditions?:Conditions[];
  @Input() public resource:'work_packages' | 'users';
  @Input() public model?:any;
  @Input() public searchFn?:any;

  @Input() public defaultOpen?:boolean = false;
  @Input() public addTag?:boolean = false;
  @Input() public virtualScroll?:boolean = false;
  @Input() public required?:boolean = false;
  @Input() public clearable?:boolean = true;
  @Input() public clearOnBackspace?:boolean = true;
  @Input() public hideSelected?:boolean = false;
  @Input() public clearSearchOnAdd?:boolean = true;
  @Input() public multiple?:boolean = false;
  @Input() public closeOnSelect?:boolean = false;
  @Input() public openOnEnter?:boolean = false;
  @Input() public appendTo?:string;
  @Input() public disabled?:string;
  @Input() public id?:string;
  @Input() public bindLabel?:string;
  @Input() public name?:string;
  @Input() public placeholder?:string;
  @Input() public searchKey?:string;
  @Input() public classes?:string;


  @Output() public onOpen = new EventEmitter<any>();
  @Output() public onClose = new EventEmitter<any>();
  @Output() public onChange = new EventEmitter<any>();
  @Output() public onFocus = new EventEmitter<any>();
  @Output() public onBlur = new EventEmitter<any>();
  @Output() public onSearch = new EventEmitter<any>();
  @Output() public onKeydown = new EventEmitter<any>();
  @Output() public onClear = new EventEmitter<any>();

  private _isEmpty:boolean;
  public _availableOptions:HalResource[] = [];
  public compareByHrefOrString = AngularTrackingHelpers.compareByHrefOrString;
  public active:Set<string>;

  public requests = new DebouncedRequestSwitchmap<string>(
    (searchTerm:string) =>  this.loadAvailable(searchTerm) ,
    errorNotificationHandler(this.halNotification),
    true
  );

  public get availableOptions() {
    return this._availableOptions;
  }

  public set availableOptions(val:HalResource[]) {
    this._availableOptions = this.halSorting.sort(val);
  }

  public isLoading = false;

  @ViewChild('ngSelectInstance', { static: true }) ngSelectInstance:NgSelectComponent;

  constructor(readonly halResourceService:HalResourceService,
              readonly halSorting:HalResourceSortingService,
              readonly apiV3Service:APIV3Service,
              readonly cdRef:ChangeDetectorRef,
              readonly I18n:I18nService,
              protected currentProject:CurrentProjectService,
              readonly halNotification:HalResourceNotificationService) {
                super();
  }

  ngOnInit() {
    this.initialization();
    this.requests.input$.next('');
  }

  initialization() {
    this
    .requests
    .output$.pipe(
      this.untilDestroyed()
    )
    .subscribe((values:HalResource[]) => {
      this.availableOptions = values;
      this.cdRef.detectChanges();
    });
  }

  public loadAvailable(matching:string):Observable<HalResource[]> {
    const filters:ApiV3FilterBuilder = this.createFilters(this.conditions ?? [], matching);
    this.isLoading = true;
    const filteredData = (this.apiV3Service[this.resource] as
      APIv3ResourceCollection<UserResource|WorkPackageResource, APIv3UserPaths|APIV3WorkPackagePaths>)
      .filtered(filters).get()
      .pipe(map(collection => collection.elements));
      filteredData.subscribe(() => this.isLoading = false);
    return filteredData;
  }

  protected createFilters(conditions:Conditions[], matching:string) {
    const filters = new ApiV3FilterBuilder();

    for (const condition of conditions) {
      filters.add(condition.name, condition.operator, condition.values);
    }
    if (matching) {
      filters.add(this.searchKey ?? '', '**', [matching]);
    }
    return filters;
  }

  public repositionDropdown() {
    if (this.ngSelectInstance) {
        const component = (this.ngSelectInstance) as any;
        if (component && component.dropdownPanel) {
          component.dropdownPanel._updatePosition();
        }
    }
  }

  public opened(val:any) {
    if (this.defaultOpen) {
      this.repositionDropdown();
    }
    else {
      this.onOpen.emit();
    }
  }

  public closed(val:any) {
    this.onClose.emit();
  }

  public changed(val:any) {
    this.onChange.emit(val);
  }

  public blured(val:any) {
    this.onBlur.emit(val);
  }

  public focused(val:any) {
    this.onFocus.emit(val);
  }

  public cleared(val:any) {
    this.onClear.emit(val);
  }

  public keydown(val:any) {
    this.onKeydown.emit(val);
  }

}
