import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/of';

type ObservableMap<T> = {
	[K in keyof T]: Observable<T[K]> | T[K];
	};

export default function combineLatestObj<T>(observablesMap: ObservableMap<T>): Observable<T> {
	const observablesList: Observable<object>[] = Object.keys(observablesMap)
		.map((key: string) => {
			const value: any = observablesMap[key];

			// TODO: why is Observable...map(...) sometimes not instanceof Observable?
			return value instanceof Observable || 'subscribe' in value
				? value.map((v: Observable<any>) => ({[key]: v}))
				: Observable.of({[key]: value}); // values are passed through
		});

	return Observable.combineLatest(observablesList)
		.map((observables: object[]) => reduceObservablesToValue<T>(observables))
		.distinctUntilChanged<T>();
}

function reduceObservablesToValue<T>(values: object[]): T {
	const result: T = <T> {};

	return values.reduce(
		(acc: T, obs: object) => {
			Object.keys(obs).forEach((key: string) => {
				acc[key] = obs[key];
			});

			return acc;
		},
		result
	);
}
