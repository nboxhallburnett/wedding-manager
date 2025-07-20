type Config = import('../../conf/index.js').Config;
declare const CONFIG: Config;

type Ref<T> = {
	value: T
}

type Toast = {
	/** Automatically generated id, used to track its associated element */
	id: String,
	/** Title to show in the toast message */
	title?: String,
	/** Content of the toast message */
	body: String
}

type AddToast = (toast: Toast, options: import('bootstrap').Toast.Options) => void;
