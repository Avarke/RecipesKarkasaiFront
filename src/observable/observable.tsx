/**
 * Observable property.
 * @typeparam TYPE Type of property value.
 */
class ObservableProperty<TYPE> {
	/** Change handler. */
	private mOnChange : (prop: ObservableProperty<TYPE>) => void;

	/** Value store. */
	private mValue : TYPE;

	/**
	 * Constructor.
	 * @param initialValue Initial value of the property.
	 * @param onChange Change handler.
	 */
	constructor(initialValue : TYPE, onChange : (prop: ObservableProperty<TYPE>) => void) {
		this.mValue = initialValue;
		this.mOnChange = onChange;
	}

	/**
	 * Value getter.
	 */
	get value() : TYPE {
		return this.mValue;
	}

	/**
	 * Value setter.
	 */
	set value(content : TYPE) {
		if( this.mValue !== content ) {
			this.mValue = content;
			this.mOnChange(this);
		}
	}
}

/**
 * Base class for observers.
 */
abstract class Observer {		
	/** Change handler to execute when observable changes. */
	protected mOnChange : () => void;

	/**
	 * Constructor.
	 * @param onChange Change handler to execute when observable changes.
	 */
	constructor(onChange : () => void) {
		this.mOnChange = onChange;
	}

	/**
	 * Is invoked by the observable container to notify about changes in an observable property.
	 * @param property Property that was changed.
	 */
	abstract notify(property: ObservableProperty<any>) : void;
}

/**
 * Observer that monitors a single property.
 */
class SinglePropertyObserver extends Observer {
	/** Property being monitored. */
	private mProperty : ObservableProperty<any>;

	/**
	 * Constructor.
	 * @param property Property to monitor.
	 * @param onChange Handler to execute when property value changes.
	 */
	constructor(property: ObservableProperty<any>, onChange : () => void) {
		super(onChange);
		this.mProperty = property;
	}

	/**
	 * Is invoked by the observable container to notify about changes in an observable property.
	 * @param property Property that was changed.
	 */
	override notify(property: ObservableProperty<any>) : void {
		if( this.mProperty === property ) {
			this.mOnChange();
		}
	}
}

/**
 * Base class for containers of observable properties. 
 */
class ObservableClass {
	/** Descriptors of observable properties. */
	private mProperties : ObservableProperty<any>[] = [];

	/** Observers registered. */
	private mObservers : Observer[] = [];

	/**
	 * Is used to defne observable property, i.e. 'let prop = this.observableProperty<bool>(true)'.
	 * @param value Initial value of the property.
	 * @returns Property descriptor.
	 */
	protected observableProperty<TYPE>(value : TYPE) : ObservableProperty<TYPE> {
		//create new property descriptor
		let onChange = 
			(prop : ObservableProperty<TYPE>) => {
				this.onPropertyChange(prop);
			};
		let prop = new ObservableProperty<TYPE>(value, onChange);

		//register the property internally
		this.mProperties.push(prop);

		//
		return prop;
	}

	/**
	 * Is invoked by the observable properties when their value changes.
	 * @param prop Property invoking the callback.
	 */
	private onPropertyChange(prop : ObservableProperty<any>) {
		//notify registred observers about the change
		this.mObservers.forEach(it => it.notify(prop));
	}

	/**
	 * Is used to register observer for a single property, i.e. 'oc.when(oc.prop, () => { ... })'.
	 * @param property Property to observe.
	 * @param onChange Handler to execute on property changes.
	 * @returns Observer descriptor.
	 */
	when(property : ObservableProperty<any>, onChange : () => void) : SinglePropertyObserver {
		let obs = new SinglePropertyObserver(property, onChange);
		this.mObservers.push(obs);

		return obs;
	}
}

//
export {
	ObservableProperty,
	SinglePropertyObserver,
	ObservableClass
}